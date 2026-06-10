<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

$input = input_json();
$email = strtolower(trim((string) ($input['email'] ?? '')));
$currentPassword = (string) ($input['current_password'] ?? '');
$newPassword = (string) ($input['new_password'] ?? '');

if ($email === '' || $currentPassword === '' || $newPassword === '') {
    respond(['error' => 'email, current_password, and new_password are required'], 422);
}
if (strlen($newPassword) < 8 || !preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/\d/', $newPassword)) {
    respond(['error' => 'New password must be 8+ chars with upper, lower, and a number'], 422);
}

$stmt = $pdo->prepare('SELECT user_id, password_hash FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($currentPassword, (string) $user['password_hash'])) {
    respond(['error' => 'Current password is incorrect'], 401);
}

$update = $pdo->prepare('UPDATE users SET password_hash = :hash WHERE user_id = :user_id');
$update->execute([
    ':hash' => password_hash($newPassword, PASSWORD_DEFAULT),
    ':user_id' => $user['user_id'],
]);

respond(['status' => 'password_changed', 'user_id' => $user['user_id']]);
