<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

$input = input_json();
$currentPassword = (string) ($input['current_password'] ?? '');
$newPassword = (string) ($input['new_password'] ?? '');

if ($currentPassword === '' || $newPassword === '') {
    respond(['error' => 'current_password and new_password are required'], 422);
}
if (strlen($newPassword) < 8 || !preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/\d/', $newPassword)) {
    respond(['error' => 'New password must be 8+ chars with upper, lower, and a number'], 422);
}

// The initial admin password is seeded by the server in config.php (ChangeMe123!).
$stmt = $pdo->prepare("SELECT id, password_hash FROM admin_users WHERE username = 'admin'");
$stmt->execute();
$admin = $stmt->fetch();

if (!$admin || !password_verify($currentPassword, (string) $admin['password_hash'])) {
    respond(['error' => 'Current admin password is incorrect'], 401);
}

$update = $pdo->prepare('UPDATE admin_users SET password_hash = :hash WHERE id = :id');
$update->execute([
    ':hash' => password_hash($newPassword, PASSWORD_DEFAULT),
    ':id' => $admin['id'],
]);

respond(['status' => 'admin_password_changed']);
