<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

$input = input_json();
$username = trim((string) ($input['username'] ?? ''));
$password = (string) ($input['password'] ?? '');

$stmt = $pdo->prepare('SELECT username, password_hash FROM admin_users WHERE username = :username');
$stmt->execute([':username' => $username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    respond(['error' => 'Invalid admin credentials'], 401);
}

respond([
    'admin' => ['username' => $admin['username']],
    'session_scope' => 'antigravity_admin',
]);