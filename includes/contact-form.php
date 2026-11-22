<?php
// SMTP values come from the untracked .env file, with server process environment overrides.
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

function contactEscape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function contactTypes(): array
{
    return ['corporate' => 'Corporate Inquiry', 'services' => 'Services Inquiry',
        'product' => 'Product sell/rent Inquiry', 'training' => 'Training Inquiry'];
}

function contactFields(array $input): array
{
    $fields = [];
    foreach (['email', 'inquiry', 'header', 'details'] as $key) {
        $value = $input[$key] ?? '';
        $fields[$key] = is_string($value) ? trim($value) : '';
    }
    return $fields;
}

function contactValidate(array $fields): array
{
    $errors = [];
    if (strlen($fields['email']) > 254 || !filter_var($fields['email'], FILTER_VALIDATE_EMAIL)
        || preg_match('/[\r\n\x00]/', $fields['email'])) {
        $errors['email'] = 'Enter a valid email address.';
    }
    if (!isset(contactTypes()[$fields['inquiry']])) {
        $errors['inquiry'] = 'Select a type of inquiry.';
    }
    if ($fields['header'] === '' || strlen($fields['header']) > 160
        || preg_match('/[\x00-\x1F\x7F]/', $fields['header'])) {
        $errors['header'] = 'Enter a subject of up to 160 bytes without line breaks.';
    }
    if ($fields['details'] === '' || strlen($fields['details']) > 10000
        || strpos($fields['details'], "\0") !== false) {
        $errors['details'] = 'Enter inquiry details of up to 10,000 bytes.';
    }
    return $errors;
}

function contactRecipients(string $value): ?array
{
    $recipients = [];
    foreach (explode(',', $value) as $address) {
        $address = trim($address);
        if (!filter_var($address, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n\x00]/', $address)) return null;
        $recipients[strtolower($address)] = $address;
    }
    return count($recipients) <= 50 ? array_values($recipients) : null;
}

function contactSmtpConfig(?string $envDirectory = null): ?array
{
    if (!is_file(__DIR__ . '/../vendor/autoload.php')) return null;
    require_once __DIR__ . '/../vendor/autoload.php';
    try {
        // Array-backed loading keeps file values out of the global process environment.
        $values = \Dotenv\Dotenv::createArrayBacked($envDirectory ?? dirname(__DIR__))->safeLoad();
    } catch (Throwable $error) {
        // Parser errors can contain secret values; never expose the exception text.
        error_log('Website mail configuration could not be loaded. Check the local .env format.');
        return null;
    }
    $config = [];
    foreach (['host' => 'SMTP_HOST', 'username' => 'SMTP_USERNAME', 'password' => 'SMTP_PASSWORD',
        'from' => 'SMTP_FROM', 'from_name' => 'SMTP_FROM_NAME', 'owners' => 'CONTACT_OWNER_EMAILS',
        'sales' => 'CONTACT_SALES_EMAILS', 'port' => 'SMTP_PORT', 'encryption' => 'SMTP_ENCRYPTION'] as $key => $name) {
        $processValue = getenv($name);
        $config[$key] = $processValue !== false ? $processValue : ($values[$name] ?? '');
    }
    $config['from_name'] = $config['from_name'] !== '' ? $config['from_name'] : 'NEMZ ENERGY website';
    $owners = contactRecipients($config['owners']);
    $sales = contactRecipients($config['sales']);
    if ($config['host'] === '' || preg_match('/[\s\x00-\x1F\/;]/', $config['host'])
        || $config['username'] === '' || $config['password'] === ''
        || !filter_var($config['from'], FILTER_VALIDATE_EMAIL) || $owners === null || $sales === null
        || strlen($config['from_name']) > 120 || preg_match('/[\x00-\x1F\x7F]/', $config['from_name'])
        || !ctype_digit($config['port']) || (int) $config['port'] < 1 || (int) $config['port'] > 65535
        || !in_array($config['encryption'], ['tls', 'smtps'], true)) {
        return null;
    }
    $config['recipients'] = contactRecipients(implode(',', array_merge($owners, $sales)));
    if ($config['recipients'] === null) return null;
    unset($config['owners'], $config['sales']);
    return $config;
}

function contactMailer(array $config, array $fields, bool $clientCopy = false): \PHPMailer\PHPMailer\PHPMailer
{
    require_once __DIR__ . '/../vendor/autoload.php';
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->SMTPDebug = 0;
    $mail->Host = $config['host'];
    $mail->Port = (int) $config['port'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['username'];
    $mail->Password = $config['password'];
    $mail->SMTPSecure = $config['encryption'] === 'smtps'
        ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
        : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Timeout = 10;
    // Socket connection and SMTP reply waits have separate limits in PHPMailer.
    $mail->getSMTPInstance()->Timelimit = 10;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['from'], $config['from_name']);
    foreach ($clientCopy ? [$fields['email']] : $config['recipients'] as $recipient) {
        $mail->addAddress($recipient);
    }
    $mail->addReplyTo($clientCopy ? $config['from'] : $fields['email']);
    $mail->Subject = ($clientCopy ? 'Copy of your inquiry: ' : 'Website inquiry: ') . $fields['header'];
    $mail->isHTML(false);
    $mail->Body = ($clientCopy ? "Thank you for contacting us. Here is a copy of your submitted inquiry.\n\n" : '')
        . 'Type: ' . contactTypes()[$fields['inquiry']] . "\n"
        . 'Email: ' . $fields['email'] . "\n"
        . 'Subject: ' . $fields['header'] . "\n\n" . $fields['details'];
    return $mail;
}

function contactSendInquiry(array $config, array $fields, ?callable $makeMailer = null): array
{
    $makeMailer ??= 'contactMailer';
    $result = ['team' => 'failed', 'client' => 'not_sent'];
    $accepted = [];
    try {
        $teamMail = $makeMailer($config, $fields, false);
        // Successful callbacks indicate SMTP DATA acceptance, even when other recipients were rejected.
        $teamMail->action_function = static function ($sent, $to) use (&$accepted): void {
            if ($sent) foreach ($to as $recipient) $accepted[strtolower($recipient[0])] = true;
        };
        if (!$teamMail->send()) throw new RuntimeException('SMTP rejected inquiry');
        $result['team'] = 'sent';
    } catch (Throwable $error) {
        // SMTP responses may contain addresses or credentials; log no exception details.
        error_log('Website inquiry team delivery failed or was incomplete. Check the SMTP service configuration.');
        if (!$accepted) return $result;
        $result['team'] = 'partial';
    }
    try {
        if (!$makeMailer($config, $fields, true)->send()) throw new RuntimeException('SMTP rejected client copy');
        $result['client'] = 'sent';
    } catch (Throwable $error) {
        error_log('Website inquiry was accepted for the team, but the client copy failed.');
        $result['client'] = 'failed';
    }
    return $result;
}

function contactRateLimit(string $ip, ?string $directory = null, ?int $now = null): bool
{
    $directory ??= sys_get_temp_dir() . '/arcutra-contact-' . substr(hash('sha256', __DIR__), 0, 12);
    $now ??= time();
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) return false;
    // Fixed buckets bound the disk usage, including requests from rotating addresses.
    $bucket = hexdec(substr(hash('sha256', $ip), 0, 3));
    $handle = @fopen($directory . '/' . $bucket . '.json', 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) {
        if ($handle) fclose($handle);
        return false;
    }
    try {
        $state = json_decode(stream_get_contents($handle), true);
        if (!is_array($state) || !isset($state['start'], $state['count'], $state['last'])
            || $now - $state['start'] >= 3600) {
            $state = ['start' => $now, 'count' => 0, 'last' => 0];
        }
        if ($state['count'] >= 5 || ($state['last'] > 0 && $now - $state['last'] < 60)) return false;
        $state['count']++;
        $state['last'] = $now;
        rewind($handle);
        if (!ftruncate($handle, 0) || fwrite($handle, json_encode($state)) === false || !fflush($handle)) return false;
        return true;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function contactFormState(): array
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start(['use_strict_mode' => 1, 'cookie_httponly' => true,
            'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'cookie_samesite' => 'Lax']);
    }
    header('Cache-Control: no-store');
    header('Referrer-Policy: same-origin');
    $_SESSION['contact_csrf'] ??= bin2hex(random_bytes(32));
    $state = ['fields' => contactFields([]), 'errors' => [], 'message' => '',
        'success' => false, 'warning' => false, 'configured' => contactSmtpConfig() !== null, 'csrf' => $_SESSION['contact_csrf']];
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET' || $method === 'HEAD') {
        // Only a real page view consumes the one-time delivery notice.
        if ($method === 'GET' && isset($_SESSION['contact_success'])) {
            $delivery = $_SESSION['contact_success'];
            $state['success'] = true;
            $state['message'] = 'Your inquiry and your confirmation copy were accepted by the mail server. Thank you for contacting us.';
            if (is_array($delivery) && $delivery['team'] === 'partial') {
                $state['warning'] = true;
                $state['message'] = 'Your inquiry was accepted for some, but not all, team recipients. Please contact us directly instead of resubmitting.';
                $state['message'] .= $delivery['client'] === 'sent'
                    ? ' Your confirmation copy was accepted by the mail server.' : ' Your confirmation copy could not be sent.';
            } elseif (is_array($delivery) && $delivery['client'] === 'failed') {
                $state['warning'] = true;
                $state['message'] = 'Your inquiry was accepted for our team, but your confirmation copy could not be sent. Please do not resubmit your inquiry.';
            }
            unset($_SESSION['contact_success']);
        }
        $type = $_GET['inquiry'] ?? '';
        if (is_string($type) && isset(contactTypes()[$type])) $state['fields']['inquiry'] = $type;
        $products = ['gas_detector' => 'Gas detector', 'harness' => 'Full body harness', 'scba' => 'SCBA',
            'tripod' => 'Safety tripod', 'fall' => 'Fall arrester', 'escape' => 'Escape set',
            'magnetic' => 'Magnetic work light', 'ppe' => 'Personal protective equipment'];
        $product = $_GET['product'] ?? '';
        if (is_string($product) && isset($products[$product])) {
            $state['fields']['inquiry'] = 'product';
            $state['fields']['header'] = 'Product inquiry: ' . $products[$product];
        }
        return $state;
    }
    if ($method !== 'POST') {
        http_response_code(405);
        header('Allow: GET, HEAD, POST');
        $state['message'] = 'This request method is not supported.';
        return $state;
    }
    $state['fields'] = contactFields($_POST);
    $token = $_POST['csrf'] ?? '';
    if (!is_string($token) || !hash_equals($_SESSION['contact_csrf'], $token)) {
        http_response_code(403);
        $state['message'] = 'Your form session expired. Review your details and try again.';
        return $state;
    }
    if (!is_string($_POST['website'] ?? '') || ($_POST['website'] ?? '') !== '') {
        http_response_code(422);
        $state['message'] = 'The inquiry could not be submitted. Please contact us by email.';
        return $state;
    }
    $state['errors'] = contactValidate($state['fields']);
    if ($state['errors']) {
        http_response_code(422);
        $state['message'] = 'Please correct the fields below. Nothing has been sent.';
        return $state;
    }
    $config = contactSmtpConfig();
    if ($config === null) {
        http_response_code(503);
        $state['message'] = 'Online sending is not configured yet. Nothing has been sent. Please email or call us directly.';
        return $state;
    }
    if (!contactRateLimit($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
        http_response_code(429);
        header('Retry-After: 60');
        $state['message'] = 'Too many inquiries. Please wait before trying again, or contact us directly.';
        return $state;
    }
    $delivery = contactSendInquiry($config, $state['fields']);
    if ($delivery['team'] === 'failed') {
        http_response_code(503);
        $state['message'] = 'We could not submit your inquiry to the mail server. Your details are still below. Please email or call us directly.';
        return $state;
    }
    // Once any team recipient accepted the inquiry, redirect and prevent a duplicate submission.
    $_SESSION['contact_csrf'] = bin2hex(random_bytes(32));
    $_SESSION['contact_success'] = $delivery;
    session_write_close();
    header('Location: contact.php#inquiry-form', true, 303);
    exit;
}
