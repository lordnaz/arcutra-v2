// Deterministic lifecycle tests for the actual inline loader script; no jQuery or browser required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const markup = readFileSync(new URL('../preloader.php', import.meta.url), 'utf8');
const script = markup.match(/<script>([\s\S]*?)<\/script>/)?.[1];
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
check(Boolean(script), 'Loader initialization script exists');
check(/id="site-preloader"[^>]*class="preloader complete"[^>]*hidden/.test(markup), 'No JavaScript means a hidden, nonblocking loader');

function createPage({ readyState = 'loading', reducedMotion = false, missing = false } = {}) {
    let now = 0;
    let timerId = 0;
    const timers = new Map();
    const events = new Map();
    const classes = new Set(['preloader', 'complete']);
    const attributes = { 'aria-hidden': 'true' };
    const loader = {
        hidden: true,
        classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
        setAttribute: (key, value) => { attributes[key] = value; }
    };
    const window = {
        matchMedia: () => ({ matches: reducedMotion }),
        addEventListener(type, callback) {
            if (!events.has(type)) events.set(type, new Set());
            events.get(type).add(callback);
        },
        removeEventListener(type, callback) { events.get(type)?.delete(callback); }
    };
    runInNewContext(script, {
        window,
        document: { readyState, getElementById: () => missing ? null : loader },
        Date: { now: () => now },
        setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, at: now + delay }); return id; },
        clearTimeout(id) { timers.delete(id); }
    });
    return {
        loader, timers, classes, attributes,
        dispatch(type, event = {}) { for (const callback of [...(events.get(type) || [])]) callback(event); },
        advance(milliseconds) {
            const until = now + milliseconds;
            while (true) {
                const next = [...timers].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
                if (!next) break;
                const [id, timer] = next;
                timers.delete(id);
                now = timer.at;
                timer.callback();
            }
            now = until;
        }
    };
}

const quick = createPage();
check(!quick.loader.hidden && !quick.classes.has('complete'), 'Loader becomes visible without jQuery');
check(quick.attributes['aria-hidden'] === 'false', 'Loading status is exposed while visible');
quick.dispatch('DOMContentLoaded');
check(!quick.loader.hidden, 'DOM readiness does not prematurely disable the loader');
quick.dispatch('load');
quick.dispatch('load');
quick.advance(349);
check(!quick.classes.has('complete'), 'Fast loads retain a brief visible animation');
quick.advance(1);
check(quick.classes.has('complete') && !quick.loader.hidden, 'Original CSS completion transition is allowed');
check(quick.attributes['aria-hidden'] === 'true', 'Completion is no longer announced as loading');
quick.advance(1000);
check(quick.loader.hidden && quick.timers.size === 0, 'Loader hides fully after transition and cleans up timers');

const slow = createPage();
slow.advance(2000);
check(!slow.loader.hidden && !slow.classes.has('complete'), 'Loader remains visible while assets load');
slow.dispatch('load');
slow.advance(1000);
check(slow.loader.hidden, 'Slow load finishes without an extra minimum delay');

const stalled = createPage();
stalled.advance(4999);
check(!stalled.loader.hidden, 'Slow loading is indicated before the safety deadline');
stalled.advance(1);
check(stalled.loader.hidden && stalled.timers.size === 0, 'Failed assets or plugins cannot block the page beyond five seconds');
stalled.dispatch('load');
stalled.advance(1000);
check(stalled.loader.hidden && stalled.timers.size === 0, 'A late load event cannot revive the overlay');

const nearDeadline = createPage();
nearDeadline.advance(4900);
nearDeadline.dispatch('load');
nearDeadline.advance(100);
check(nearDeadline.loader.hidden, 'Safety deadline also bounds an in-progress exit transition');

for (const event of ['pagehide', 'pageshow']) {
    const restored = createPage();
    restored.dispatch(event, { persisted: true });
    check(restored.loader.hidden && restored.timers.size === 0, `${event}: cached navigation never traps the visitor`);
}
const normalShow = createPage();
normalShow.dispatch('pageshow', { persisted: false });
check(!normalShow.loader.hidden, 'An ordinary pageshow does not skip the loading lifecycle');

const reduced = createPage({ reducedMotion: true });
reduced.dispatch('load');
reduced.advance(0);
check(reduced.loader.hidden, 'Reduced motion avoids minimum animation and transition delays');
const complete = createPage({ readyState: 'complete' });
check(complete.loader.hidden && complete.timers.size === 0, 'An already loaded document does not flash an overlay');
const missing = createPage({ missing: true });
check(missing.timers.size === 0, 'Missing loader markup is harmless');

console.log(`Passed ${checks} loader lifecycle checks.`);
