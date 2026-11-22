<?php
// Run with: php tests/contact-form-test.php. No network connections or real mail.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../includes/contact-form.php';

$checks = 0;
function check(bool $condition, string $label): void
{
    global $checks;
    if (!$condition) throw new RuntimeException($label);
    $checks++;
}

$valid = ['email' => 'visitor@example.test', 'inquiry' => 'product',
    'header' => 'Quotation request', 'details' => "A product inquiry.\nSecond line."];
check(contactValidate($valid) === [], 'Accept a valid inquiry');
check(count(contactValidate(contactFields([]))) === 4, 'Require all four fields');
check(contactFields(['email' => ['bad'], 'details' => ['bad']])['email'] === '', 'Reject array fields');
foreach (["visitor@example.test\r\nBcc: other@example.test", 'invalid', str_repeat('a', 255)] as $email) {
    check(isset(contactValidate(array_replace($valid, ['email' => $email]))['email']), 'Reject invalid email');
}
foreach (['', "Header\r\nInjected", str_repeat('a', 161)] as $subject) {
    check(isset(contactValidate(array_replace($valid, ['header' => $subject]))['header']), 'Reject invalid subject');
}
foreach (['', "Text\0", str_repeat('a', 10001)] as $details) {
    check(isset(contactValidate(array_replace($valid, ['details' => $details]))['details']), 'Reject invalid details');
}
check(isset(contactValidate(array_replace($valid, ['inquiry' => 'unknown']))['inquiry']), 'Allowlist inquiry type');
check(contactEscape('<script>"&') === '&lt;script&gt;&quot;&amp;', 'Escape HTML');

$envNames = ['SMTP_HOST', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_FROM', 'SMTP_FROM_NAME', 'CONTACT_OWNER_EMAILS', 'CONTACT_SALES_EMAILS', 'SMTP_PORT', 'SMTP_ENCRYPTION'];
foreach ($envNames as $name) putenv($name . '=');
check(contactSmtpConfig() === null, 'Unconfigured SMTP stays unavailable');
check(contactRecipients('owner@example.test, sales@example.test,OWNER@example.test') === ['OWNER@example.test', 'sales@example.test'], 'Recipients are trimmed and deduplicated');
foreach (['', 'invalid', 'owner@example.test,', "owner@example.test\r\nBcc: injected@example.test"] as $list) {
    check(contactRecipients($list) === null, 'Reject malformed recipient lists');
}

$envDirectory = __DIR__ . '/../.hallmark/tests/env-' . bin2hex(random_bytes(6));
mkdir($envDirectory, 0700, true);
file_put_contents($envDirectory . '/.env', <<<'ENV'
SMTP_HOST='smtp.example.test'
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME='website@example.test'
SMTP_PASSWORD='test-only # $ ${SMTP_HOST}'
SMTP_FROM='website@example.test'
SMTP_FROM_NAME='Test Sender'
CONTACT_OWNER_EMAILS='owner@example.test'
CONTACT_SALES_EMAILS='sales@example.test,owner@example.test'
ENV
);
foreach ($envNames as $name) putenv($name);
$loaded = contactSmtpConfig($envDirectory);
check($loaded !== null && $loaded['host'] === 'smtp.example.test', 'Load SMTP settings from local .env');
check($loaded['password'] === 'test-only # $ ${SMTP_HOST}', 'Quoted passwords retain special characters literally');
check($loaded['from_name'] === 'Test Sender', 'Load sender name');
check($loaded['recipients'] === ['owner@example.test', 'sales@example.test'], 'Merge and deduplicate owner/sales lists');
check(getenv('SMTP_PASSWORD') === false, 'File values do not leak into process environment');
putenv('SMTP_HOST=override.example.test');
check(contactSmtpConfig($envDirectory)['host'] === 'override.example.test', 'Process environment takes priority');
putenv('CONTACT_SALES_EMAILS=');
check(contactSmtpConfig($envDirectory) === null, 'A missing sales list disables online sending');
putenv('CONTACT_SALES_EMAILS=bad-address');
check(contactSmtpConfig($envDirectory) === null, 'An invalid sales list disables online sending');
putenv('CONTACT_SALES_EMAILS=sales@example.test');
putenv('SMTP_ENCRYPTION=plain');
check(contactSmtpConfig($envDirectory) === null, 'Reject unencrypted SMTP');
foreach ($envNames as $name) putenv($name . '=');
$previousLog = ini_set('error_log', $envDirectory . '/expected-errors.log');
file_put_contents($envDirectory . '/.env', "SMTP_PASSWORD='private-test-marker");
check(contactSmtpConfig($envDirectory) === null, 'Malformed .env fails safely');
check(!str_contains(file_get_contents($envDirectory . '/expected-errors.log'), 'private-test-marker'), 'Parser logs never expose input values');
ini_set('error_log', $previousLog);

$directory = __DIR__ . '/../.hallmark/tests/rate-' . bin2hex(random_bytes(6));
check(contactRateLimit('test-source', $directory, 10000), 'First inquiry allowed');
check(!contactRateLimit('test-source', $directory, 10001), 'Immediate retry denied');
for ($i = 1; $i < 5; $i++) check(contactRateLimit('test-source', $directory, 10000 + $i * 60), 'Spaced retry allowed');
check(!contactRateLimit('test-source', $directory, 10300), 'Hourly cap enforced');
check(contactRateLimit('test-source', $directory, 13600), 'Hourly cap resets');
check(!contactRateLimit('test-source', __FILE__, 10000), 'Storage failure denies sending');

require_once __DIR__ . '/../vendor/autoload.php';
class MemorySmtp extends \PHPMailer\PHPMailer\SMTP
{
    public string $message = '';
    public bool $reject = false;
    public array $recipients = [];
    public array $rejectRecipients = [];
    public function connect($host, $port = null, $timeout = 30, $options = []) { return true; }
    public function connected() { return true; }
    public function hello($host = '') { return true; }
    public function getServerExt($name) { return false; }
    public function startTLS() { return true; }
    public function authenticate($username, $password, $authtype = null, $OAuth = null) { return true; }
    public function mail($from) { return true; }
    public function recipient($address, $dsn = '')
    {
        $this->recipients[] = $address;
        return !in_array($address, $this->rejectRecipients, true);
    }
    public function data($data) { $this->message = $data; return !$this->reject; }
    public function quit($close_on_error = true) { return true; }
    public function close() {}
    public function reset() { return true; }
}

$config = ['host' => 'smtp.example.test', 'port' => '587', 'encryption' => 'tls',
    'username' => 'test-only', 'password' => 'test-only-not-a-secret',
    'from' => 'website@example.test', 'from_name' => 'NEMZ ENERGY website',
    'recipients' => ['owner@example.test', 'sales@example.test', 'sales2@example.test']];
$mail = contactMailer($config, $valid);
check($mail->Timeout === 10, 'SMTP connection timeout is bounded');
check($mail->getSMTPInstance()->Timelimit === 10, 'SMTP replies cannot use the five-minute default');
$implicitTls = contactMailer(array_replace($config, ['port' => '465', 'encryption' => 'smtps']), $valid);
check($implicitTls->SMTPSecure === 'ssl' && $implicitTls->Port === 465, 'Port 465 can use implicit TLS');
check($implicitTls->SMTPOptions === [], 'Implicit TLS retains certificate verification');
$smtp = new MemorySmtp();
$mail->setSMTPInstance($smtp);
check($mail->send(), 'Mail can be accepted by an in-memory SMTP double');
check(str_contains($smtp->message, 'Reply-To: visitor@example.test'), 'Visitor is Reply-To, not From');
check(str_contains($smtp->message, 'From: NEMZ ENERGY website <website@example.test>'), 'Use configured sender');
check($smtp->recipients === $config['recipients'], 'Deliver to every owner and sales recipient');
check(str_contains($smtp->message, 'To: owner@example.test'), 'Use configured owner');
check(!in_array($valid['email'], $smtp->recipients, true), 'Client is not added to the internal message');
check(str_contains($smtp->message, 'Subject: Website inquiry: Quotation request'), 'Subject retained');
check(str_contains($smtp->message, 'Second line.'), 'Details included');
check(str_contains($smtp->message, 'text/plain'), 'Plain-text email');
check($mail->SMTPSecure === 'tls' && $mail->SMTPOptions === [], 'TLS required without verification bypass');

$failed = contactMailer($config, $valid);
$rejectingSmtp = new MemorySmtp();
$rejectingSmtp->reject = true;
$failed->setSMTPInstance($rejectingSmtp);
$thrown = false;
try { $failed->send(); } catch (\PHPMailer\PHPMailer\Exception $error) { $thrown = true; }
check($thrown, 'SMTP rejection is not treated as success');

$copy = contactMailer($config, $valid, true);
$copySmtp = new MemorySmtp();
$copy->setSMTPInstance($copySmtp);
check($copy->send(), 'Client copy is independently sendable');
check($copySmtp->recipients === [$valid['email']], 'Client copy is addressed only to the client');
check(str_contains($copySmtp->message, 'Reply-To: website@example.test'), 'Client can reply to the sender mailbox');
check(str_contains($copySmtp->message, 'Subject: Copy of your inquiry: Quotation request'), 'Client receives a clearly labeled copy');
check(str_contains($copySmtp->message, 'Second line.'), 'Client copy contains submitted details');
foreach ($config['recipients'] as $recipient) check(!str_contains($copySmtp->message, $recipient), 'Internal recipients remain private');

$previousLog = ini_set('error_log', $envDirectory . '/expected-errors.log');
foreach (['accept', 'team-reject', 'client-reject', 'team-partial', 'partial-client-reject', 'all-recipients-reject'] as $mode) {
    $transports = [];
    $delivery = contactSendInquiry($config, $valid, static function ($settings, $fields, $clientCopy) use ($mode, &$transports) {
        $message = contactMailer($settings, $fields, $clientCopy);
        $transport = new MemorySmtp();
        $transport->reject = (!$clientCopy && $mode === 'team-reject')
            || ($clientCopy && in_array($mode, ['client-reject', 'partial-client-reject'], true));
        if (!$clientCopy && in_array($mode, ['team-partial', 'partial-client-reject'], true)) {
            $transport->rejectRecipients = ['sales@example.test', 'sales2@example.test'];
        }
        if (!$clientCopy && $mode === 'all-recipients-reject') $transport->rejectRecipients = $settings['recipients'];
        $message->setSMTPInstance($transport);
        $transports[] = $transport;
        return $message;
    });
    $teamFailed = in_array($mode, ['team-reject', 'all-recipients-reject'], true);
    $partial = in_array($mode, ['team-partial', 'partial-client-reject'], true);
    $clientFailed = in_array($mode, ['client-reject', 'partial-client-reject'], true);
    check($delivery['team'] === ($teamFailed ? 'failed' : ($partial ? 'partial' : 'sent')), "$mode: accurate team outcome");
    check($delivery['client'] === ($teamFailed ? 'not_sent' : ($clientFailed ? 'failed' : 'sent')), "$mode: accurate client outcome");
    check(count($transports) === ($teamFailed ? 1 : 2), "$mode: no confirmation for a completely failed inquiry");
    if (!$teamFailed) check($transports[1]->recipients === [$valid['email']], "$mode: client recipient remains separate");
}
ini_set('error_log', $previousLog);

echo "Passed $checks contact-form checks; no real email sent.\n";
