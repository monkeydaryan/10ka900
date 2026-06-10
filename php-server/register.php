<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

$pdo->exec("ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT ''");

$input = input_json();
$email = strtolower(trim((string) ($input['email'] ?? '')));
$displayName = trim((string) ($input['display_name'] ?? ''));
$phone = trim((string) ($input['phone'] ?? ''));
$password = (string) ($input['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'A valid email is required'], 422);
}
if (strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/\d/', $password)) {
    respond(['error' => 'Password must be 8+ chars with upper, lower, and a number'], 422);
}

$stmt = $pdo->prepare('SELECT user_id FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);
if ($stmt->fetch()) {
    respond(['error' => 'Email already registered'], 409);
}

$userId = 'M90-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 9));

$insert = $pdo->prepare('INSERT INTO users (user_id, display_name, email, wallet, password_hash) VALUES (:user_id, :display_name, :email, :wallet, :password_hash)');
$insert->execute([
    ':user_id' => $userId,
    ':display_name' => $displayName !== '' ? $displayName : 'Market 90x Player',
    ':email' => $email,
    ':wallet' => 2500,
    ':password_hash' => password_hash($password, PASSWORD_DEFAULT), // bcrypt — never plaintext
]);

respond(['user_id' => $userId, 'status' => 'registered'], 201);
