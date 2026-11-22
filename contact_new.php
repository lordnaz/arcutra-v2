<?php
// Retired address of the inquiry form. Existing links and bookmarks continue to contact.php.
$query = $_SERVER['QUERY_STRING'] ?? '';
header('Location: contact.php' . ($query !== '' ? '?' . $query : ''), true, 301);
