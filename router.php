<?php
// PHP's development server ignores .htaccess. Run it through this router via composer serve.
if (PHP_SAPI !== 'cli-server') {
    http_response_code(404);
    exit;
}
$path = str_replace('\\', '/', rawurldecode(explode('?', $_SERVER['REQUEST_URI'] ?? '/', 2)[0]));
if (preg_match('~(?:^|/)(?:(?!\.well-known(?:/|$))\.[^/]*|vendor|includes|tests|legacy)(?:/|$)~i', $path)
    || preg_match('~(?:^|/)composer\.(?:json|lock)(?:/|$)~i', $path)
    // Without this the server answers unknown addresses with the landing page instead of a 404.
    || !(is_file(__DIR__ . $path) || is_file(rtrim(__DIR__ . $path, '/') . '/index.php'))) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Not found';
    return true;
}
return false;
