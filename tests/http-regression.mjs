// Run with: node tests/http-regression.mjs [accept|reject|client-reject|team-partial|stall].
// Starts an isolated PHP server; SMTP is disabled or replaced by a non-network test double.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const sessionPath = path.join(root, '.hallmark', 'tests', 'sessions');
mkdirSync(sessionPath, { recursive: true });
const probe = createServer();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const base = `http://127.0.0.1:${port}/`;
const env = { ...process.env };
for (const key of ['SMTP_HOST', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_FROM', 'SMTP_FROM_NAME', 'CONTACT_OWNER_EMAILS', 'CONTACT_SALES_EMAILS', 'SMTP_PORT', 'SMTP_ENCRYPTION']) env[key] = '';
const smtpMode = process.argv[2] || 'disabled';
assert.ok(['disabled', 'accept', 'reject', 'client-reject', 'team-partial', 'stall'].includes(smtpMode), 'Use accept, reject, client-reject, team-partial, stall, or no argument');
const smtpSockets = new Set();
const smtpServer = smtpMode === 'stall' ? createServer(socket => {
    smtpSockets.add(socket);
    socket.on('close', () => smtpSockets.delete(socket));
    socket.on('error', () => {});
    // Intentionally never send a greeting; all traffic stays on loopback.
}) : null;
if (smtpServer) await new Promise(resolve => smtpServer.listen(0, '127.0.0.1', resolve));
const phpArgs = ['-d', `session.save_path=${sessionPath}`, '-d', 'display_errors=1'];
if (smtpMode !== 'disabled') {
    const tempPath = path.join(root, '.hallmark', 'tests', `smtp-${smtpMode}-${port}`);
    mkdirSync(tempPath, { recursive: true });
    Object.assign(env, { ARCUTRA_TEST_SMTP: 'enabled', ARCUTRA_TEST_RESULT: smtpMode,
        SMTP_HOST: 'smtp.example.test', SMTP_USERNAME: 'test-only', SMTP_PASSWORD: 'test-only-not-a-secret',
        SMTP_FROM: 'website@example.test', SMTP_FROM_NAME: 'Test Website', CONTACT_OWNER_EMAILS: 'owner@example.test',
        CONTACT_SALES_EMAILS: 'sales@example.test,sales2@example.test', SMTP_PORT: '587', SMTP_ENCRYPTION: 'tls' });
    phpArgs.push('-d', `sys_temp_dir=${tempPath}`);
    if (smtpServer) {
        env.SMTP_HOST = '127.0.0.1';
        env.SMTP_PORT = String(smtpServer.address().port);
    } else {
        phpArgs.push('-d', `auto_prepend_file=${path.join(root, 'tests', 'fixtures', 'smtp-double.php')}`);
    }
}
phpArgs.push('-S', `127.0.0.1:${port}`, '-t', root, path.join(root, 'router.php'));
const server = spawn('php', phpArgs, { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = '';
server.stdout.on('data', data => { log += data; });
server.stderr.on('data', data => { log += data; });
let startupError;
server.on('error', error => { startupError = error; });
let checks = 0;
function check(condition, label) { assert.ok(condition, label); checks++; }
// Runs the real assets/contact.js against a minimal document; no browser is required.
function verifySubmissionFeedback(configured) {
    const element = id => ({ id, value: 'filled', textContent: '', disabled: false, validity: {}, validationMessage: '', attributes: {}, dataset: {}, selectedOptions: [],
        setAttribute(key, value) { this.attributes[key] = value; }, getAttribute(key) { return this.attributes[key]; },
        addEventListener(type, handler) { (this.events ??= {})[type] = handler; }, focus() {}, contains: () => false,
        append() {}, replaceChildren() {} });
    const button = Object.assign(element('sendmail'), { textContent: 'Send inquiry', disabled: !configured });
    const form = Object.assign(element('inquiry-form'), { querySelector: () => button });
    const nodes = { 'inquiry-form': form, 'contact-availability': configured ? null : element('contact-availability'),
        'contact-feedback': null, 'site-preloader': null, 'inquiry-types': null };
    const events = {};
    const listeners = {};
    runInNewContext(readFileSync(path.join(root, 'assets', 'contact.js'), 'utf8'), {
        window: { scrollY: 0, matchMedia: () => ({ matches: true, addEventListener() {} }), addEventListener: (type, handler) => {
            (listeners[type] ??= []).push(handler);
            events[type] = (event = {}) => listeners[type].forEach(listener => listener(event));
        } },
        document: { documentElement: {}, getElementById: id => id in nodes ? nodes[id] : (nodes[id] = element(id)),
            querySelector: () => Object.assign(element('training'), { open: false }), querySelectorAll: () => [], addEventListener() {},
            createDocumentFragment: () => element('fragment'), createElement: tag => element(tag) },
        getComputedStyle: () => ({ getPropertyValue: () => '' }), location: { hash: '' }, requestAnimationFrame: callback => callback(), cancelAnimationFrame() {}
    });
    const progress = nodes['contact-progress'];
    const idle = () => button.disabled === !configured && button.textContent === 'Send inquiry';
    const event = () => ({ defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } });
    form.events.submit({ defaultPrevented: true });
    check(idle(), 'Already-cancelled submission does not lock the form');
    const first = event();
    form.events.submit(first);
    check(first.defaultPrevented === !configured, 'Only a configured form can submit');
    if (configured) {
        check(button.disabled && button.textContent === 'Sending…', 'Sending state prevents repeated button clicks');
        check(form.attributes['aria-busy'] === 'true' && progress.textContent.includes('Please wait'), 'Sending state is announced');
        const duplicate = event();
        form.events.submit(duplicate);
        check(duplicate.defaultPrevented, 'Repeated submit events are blocked');
    }
    events.pageshow();
    check(idle() && progress.textContent === '', 'Back navigation restores the original button state');
    check(form.attributes['aria-busy'] === 'false', 'Back navigation clears the busy state');
    nodes.email.value = '';
    const empty = event();
    form.events.submit(empty);
    check(empty.defaultPrevented && idle(), 'An incomplete form is never submitted');
    if (configured) check(nodes.email.attributes['aria-invalid'] === 'true' && nodes['email-error'].textContent !== '', 'Missing field is named before sending');
}
async function get(route, expected = 200, options = {}) {
    const response = await fetch(new URL(route, base), { redirect: 'manual', ...options });
    assert.equal(response.status, expected, `${route}: HTTP status`);
    checks++;
    const html = await response.text();
    check(!/Fatal error:|Warning:|Notice:|Deprecated:/.test(html), `${route}: no PHP diagnostics`);
    return { response, html };
}

try {
    for (const file of ['router.php', 'index.php', 'product.php', 'contact.php', 'contact_new.php', 'preloader.php',
        'includes/contact-form.php', 'tests/contact-form-test.php', 'tests/fixtures/smtp-double.php']) {
        const lint = spawnSync('php', ['-l', path.join(root, file)], { encoding: 'utf8' });
        check(lint.status === 0, `${file}: PHP syntax (${lint.stdout}${lint.stderr})`);
    }
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
        if (startupError) throw startupError;
        if (server.exitCode !== null) throw new Error('PHP server exited: ' + log);
        try { await fetch(base); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    check(ready, 'PHP server starts');
    if (smtpMode !== 'disabled') {
        const initial = await get('contact.php');
        verifySubmissionFeedback(true);
        const cookie = initial.response.headers.get('set-cookie').split(';')[0];
        const csrf = initial.html.match(/name="csrf" value="([a-f0-9]{64})"/)[1];
        check(!initial.html.includes('id="contact-availability"') && initial.html.includes('id="form-note"'), 'Configured form is enabled');
        check(/<button[^>]*name="sendmail">Send inquiry<\/button>/.test(initial.html), 'Configured Send is not disabled');
        const values = { csrf, website: '', email: 'visitor@example.test', inquiry: 'product', header: 'Test subject', details: 'Test details' };
        const options = { method: 'POST', headers: { Cookie: cookie }, body: new URLSearchParams(values) };
        if (smtpMode === 'stall') {
            const started = performance.now();
            const failed = await get('contact.php', 503, { ...options, signal: AbortSignal.timeout(16000) });
            const elapsed = performance.now() - started;
            check(elapsed >= 9000 && elapsed < 15000, 'Unresponsive SMTP greeting stops around ten seconds, not five minutes');
            check(failed.html.includes('could not submit your inquiry'), 'Timeout has an honest failure message');
            check(failed.html.includes('value="Test subject"') && failed.html.includes('>Test details</textarea>'), 'Timeout preserves entered values');
            check(!failed.html.includes('test-only-not-a-secret'), 'Timeout exposes no credentials');
            await get('index.php');
            console.log(`Stalled SMTP greeting returned in ${(elapsed / 1000).toFixed(1)} seconds.`);
        } else if (smtpMode !== 'reject') {
            const sent = await get('contact.php', 303, options);
            check(sent.response.headers.get('location') === 'contact.php#inquiry-form', 'Successful POST redirects');
            await get('contact.php', 200, { method: 'HEAD', headers: { Cookie: cookie } });
            const success = await get('contact.php', 200, { headers: { Cookie: cookie } });
            if (smtpMode === 'accept') {
                check(success.html.includes('Your inquiry and your confirmation copy were accepted by the mail server'), 'Both messages accepted');
                check(/class="feedback feedback-success"[^>]*role="status"/.test(success.html), 'Success is a polite status');
            } else {
                check(/class="feedback feedback-warning"[^>]*role="alert"/.test(success.html), 'Partial delivery has a warning');
                check(success.html.includes(smtpMode === 'client-reject' ? 'confirmation copy could not be sent' : 'some, but not all, team recipients'), 'Partial-delivery explanation');
                check(success.html.includes(smtpMode === 'client-reject' ? 'do not resubmit' : 'instead of resubmitting'), 'No duplicate inquiry encouraged');
            }
            check(!success.html.includes('value="Test subject"'), 'Success clears submitted fields');
            const nextToken = success.html.match(/name="csrf" value="([a-f0-9]{64})"/)[1];
            check(nextToken !== csrf, 'Successful submission rotates CSRF token');
            const refreshed = await get('contact.php', 200, { headers: { Cookie: cookie } });
            check(!refreshed.html.includes('id="contact-feedback"'), 'Refresh does not repeat success or partial-delivery feedback');
            await get('contact.php', 403, options);
            const limited = await get('contact.php', 429, { ...options, body: new URLSearchParams({ ...values, csrf: nextToken }) });
            check(limited.response.headers.get('retry-after') === '60', 'Rate limit supplies retry guidance');
        } else {
            const failed = await get('contact.php', 503, options);
            check(failed.html.includes('could not submit your inquiry'), 'SMTP rejection shows honest failure');
            check(/class="feedback feedback-error"[^>]*role="alert"/.test(failed.html), 'SMTP rejection is announced as an error');
            check(failed.html.includes('value="Test subject"') && failed.html.includes('>Test details</textarea>'), 'SMTP rejection retains values');
            check(!failed.html.includes('test-only-not-a-secret') && !failed.html.includes('smtp.example.test'), 'SMTP configuration is not exposed');
            await get('contact.php', 429, options);
            const otherSession = await get('contact.php');
            const otherCookie = otherSession.response.headers.get('set-cookie').split(';')[0];
            const otherToken = otherSession.html.match(/name="csrf" value="([a-f0-9]{64})"/)[1];
            await get('contact.php', 429, { method: 'POST', headers: { Cookie: otherCookie }, body: new URLSearchParams({ ...values, csrf: otherToken }) });
        }
        check(!/PHP (?:Warning|Fatal error|Notice|Deprecated)/.test(log), 'No PHP diagnostics in SMTP flow');
        console.log(`Passed ${checks} simulated SMTP ${smtpMode} checks. No network mail transport used.`);
    } else {
    const resources = new Set(['fonts/Nexa-Light.otf', 'fonts/Nexa-Bold.otf']);
    for (const route of ['index.php', 'product.php', 'contact.php']) {
        const { response, html } = await get(route);
        check(html.includes('</html>'), `${route}: full document`);
        if (route === 'contact.php') {
            check(!html.includes('id="site-preloader"'), 'Contact form is available without a blocking loader');
        } else {
            check((html.match(/id="site-preloader"/g) || []).length === 1, `${route}: one shared loader`);
            check(/id="site-preloader"[^>]*class="preloader complete"[^>]*hidden/.test(html), `${route}: loader defaults to hidden without JavaScript`);
        }
        for (const asset of ['scroll-motion', 'coding-words', 'particles', 'back-to-top', 'scroll-meter']) {
            check(html.includes(`src="assets/${asset}.js"`), `${route}: shared ${asset} behavior is wired`);
        }
        for (const page of ['index.php', 'product.php', 'contact.php']) check(html.includes(`href="${page}"`), `${route}: navigation reaches ${page}`);
        check(/<title>[^<]+<\/title>/.test(html) && /<meta name="description" content="[^"]+">/.test(html), `${route}: title and description`);
        check(!/noindex|preview|contact_new|legacy\/|\.\.\//i.test(html), `${route}: no preview or retired references`);
        check(response.headers.get('x-robots-tag') === null, `${route}: open to indexing`);
        for (const match of html.matchAll(/(?:src|href)="((?:assets|img|doc)\/[^"#?]+)"/g)) resources.add(match[1]);
        await get(route, 200, { method: 'HEAD' });
    }
    for (const route of ['index.php', 'product.php']) {
        const { response } = await get(route);
        check(response.headers.get('set-cookie') === null, `${route}: no session cookie on a static page`);
        check(!(response.headers.get('cache-control') || '').includes('no-store'), `${route}: cacheable`);
        const refused = await get(route, 405, { method: 'POST' });
        check(refused.response.headers.get('allow') === 'GET, HEAD', `${route}: read-only`);
    }
    const home = await get('');
    check(home.html.includes('id="home-heading"'), 'Site root serves the landing page');
    for (const sheet of ['home', 'product', 'contact']) {
        const { html } = await get(`assets/${sheet}.css`);
        for (const match of html.matchAll(/@import url\("\.\/([^"]+)"\)/g)) resources.add(`assets/${match[1]}`);
    }
    const tokens = await get('assets/tokens.css');
    check([...tokens.html.matchAll(/url\("\.\.\/(fonts\/[^"]+)"\)/g)].length === 2, 'Both font faces resolve from the stylesheet folder');
    const categories = ['gas_detector', 'harness', 'scba', 'tripod', 'fall', 'escape', 'magnetic', 'ppe'];
    const catalog = (await get('product.php')).html;
    for (const category of categories) {
        check(catalog.includes(`id="plate-${category}"`) && catalog.includes(`href="#plate-${category}"`), `${category}: catalog plate and index link`);
        check(catalog.includes(`href="contact.php?product=${category}#inquiry-form"`), `${category}: populated inquiry link`);
        const inquiry = await get(`contact.php?inquiry=product&product=${category}`);
        check(/value="product"[^>]* selected/.test(inquiry.html), `${category}: inquiry type preselected`);
        check(inquiry.html.includes('value="Product inquiry:'), `${category}: subject prefilled`);
    }
    for (const resource of resources) {
        const response = await fetch(new URL(resource, base), { method: 'HEAD' });
        check(response.status === 200, `${resource}: available`);
        if (resource.endsWith('.pdf')) check(response.headers.get('content-type')?.includes('application/pdf'), `${resource}: PDF content type`);
    }
    const moved = await get('contact_new.php', 301);
    check(moved.response.headers.get('location') === 'contact.php', 'Retired contact address redirects permanently');
    const movedQuery = await get('contact_new.php?inquiry=product&product=ppe', 301);
    check(movedQuery.response.headers.get('location') === 'contact.php?inquiry=product&product=ppe', 'Redirect keeps the inquiry prefill');
    for (const retired of ['services.php', 'project.php', 'gas.php', 'soon.php', 'test.php', '_config.php', 'index_backup.php',
        'product/ppe.php', 'css/style.css', 'js/main.js', 'v2/index.php', 'v2/', 'missing-page']) {
        await get(retired, 404);
    }
    for (const archived of ['legacy/', 'legacy/index.php', 'legacy/_config.php', 'legacy/contact_new.php', 'legacy/css/style.css', 'LEGACY/test.php']) {
        const blocked = await get(archived, 404);
        check(blocked.html === 'Not found', `${archived}: archive is not served`);
    }
    await get('includes/contact-form.php', 404);
    await get('tests/contact-form-test.php', 404);
    for (const hidden of ['.env', '%2eenv', '.env.backup', '.env/extra', '.git/config', '.hallmark/log.json', 'composer.json', 'composer.lock', 'vendor/autoload.php']) {
        const blocked = await get(hidden, 404);
        check(!blocked.html.includes('SMTP_PASSWORD'), `${hidden}: no environment disclosure`);
    }
    for (const hidden of ['/.env', '//.env', '%2f.env', '%5c.env', '.env?download=1']) {
        const response = await fetch(base + hidden);
        check(response.status === 404, `${hidden}: noncanonical secret path blocked`);
        check(!(await response.text()).includes('SMTP_PASSWORD'), `${hidden}: no secret content`);
    }

    const initial = await get('contact.php');
    verifySubmissionFeedback(false);
    const cookie = initial.response.headers.get('set-cookie').split(';')[0];
    const csrf = initial.html.match(/name="csrf" value="([a-f0-9]{64})"/)[1];
    check(/HttpOnly/i.test(initial.response.headers.get('set-cookie')), 'HTTP-only session cookie');
    check(/SameSite=Lax/i.test(initial.response.headers.get('set-cookie')), 'SameSite cookie');
    check(initial.response.headers.get('cache-control').includes('no-store'), 'Form is not cached');
    check(/<button[^>]*name="sendmail" disabled>/.test(initial.html) && initial.html.includes('id="contact-availability"'), 'Unconfigured Send is disabled');
    check(initial.html.includes('aria-describedby="contact-availability"') && !initial.html.includes('id="form-note"'), 'Unavailable sending is explained with direct contacts');
    check(/<textarea[^>]*id="details" name="details"/.test(initial.html), 'Details has a submitted name');
    const values = { csrf, website: '', email: 'visitor@example.test', inquiry: 'product', header: 'Test subject', details: 'Test details' };
    const post = (fields, status) => get('contact.php', status, { method: 'POST', headers: { Cookie: cookie }, body: new URLSearchParams(fields) });
    await post({ ...values, csrf: '' }, 403);
    await post({ ...values, csrf: 'bad' }, 403);
    await post({ ...values, website: 'spam' }, 422);
    await post({ ...values, inquiry: 'unknown' }, 422);
    await post({ ...values, header: 'Subject\r\nBcc: injection' }, 422);
    await post({ ...values, details: 'x'.repeat(10001) }, 422);
    const missing = await post({ csrf, website: '' }, 422);
    for (const field of ['email', 'inquiry', 'header', 'details']) {
        check(new RegExp(`id="${field}"[^>]+aria-invalid="true"`).test(missing.html) && missing.html.includes(`<li><a href="#${field}">`), `${field}: labeled validation error`);
    }
    const escaped = await post({ ...values, email: 'bad', header: '<script>alert(1)</script>', details: '</textarea><script>alert(2)</script>' }, 422);
    check(escaped.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'Subject is HTML escaped');
    check(!escaped.html.includes('<script>alert(2)</script>'), 'Textarea cannot inject markup');
    check(escaped.html.includes('&lt;/textarea&gt;'), 'Details retained safely');
    const unavailable = await post(values, 503);
    check(unavailable.html.includes('Nothing has been sent'), 'No false success without SMTP');
    check(unavailable.html.includes('value="Test subject"') && unavailable.html.includes('>Test details</textarea>'), 'Failure retains entered values');
    const refused = await get('contact.php', 405, { method: 'PUT', headers: { Cookie: cookie } });
    check(refused.response.headers.get('allow') === 'GET, HEAD, POST', 'Unsupported methods name the allowed ones');
    await get('contact.php?inquiry[]=product&product[]=ppe');
    check(!/PHP (?:Warning|Fatal error|Notice|Deprecated)/.test(log), 'Server logs contain no PHP diagnostics');
    console.log(`Passed ${checks} HTTP regression checks; checked ${resources.size} local assets/documents. No real email sent.`);
    }
} finally {
    server.kill();
    if (smtpServer) {
        for (const socket of smtpSockets) socket.destroy();
        await new Promise(resolve => smtpServer.close(resolve));
    }
}
