<?php
namespace PHPMailer\PHPMailer;

// Only the isolated regression server may load this non-network transport.
if (PHP_SAPI !== 'cli-server' || getenv('ARCUTRA_TEST_SMTP') !== 'enabled'
    || !in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)
    || realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

#[\AllowDynamicProperties]
class PHPMailer
{
    public const ENCRYPTION_SMTPS = 'ssl';
    public const ENCRYPTION_STARTTLS = 'tls';
    public function __construct($exceptions = null) {}
    public function isSMTP() {}
    private ?\stdClass $smtp = null;
    public function getSMTPInstance() { return $this->smtp ??= new \stdClass(); }
    public function setFrom($address, $name = '') {}
    public array $addresses = [];
    public function addAddress($address) { $this->addresses[] = $address; }
    public function addReplyTo($address) {}
    public function isHTML($value) {}
    public function send(): bool
    {
        $mode = getenv('ARCUTRA_TEST_RESULT');
        $clientCopy = str_starts_with($this->Subject, 'Copy of your inquiry:');
        if ($mode === 'reject' || ($mode === 'client-reject' && $clientCopy)) {
            throw new \RuntimeException('Simulated SMTP rejection');
        }
        if (isset($this->action_function)) {
            foreach ($this->addresses as $index => $address) {
                ($this->action_function)($mode !== 'team-partial' || $index === 0, [[$address, '']]);
            }
        }
        if ($mode === 'team-partial' && !$clientCopy) throw new \RuntimeException('Simulated partial recipient rejection');
        return true;
    }
}
