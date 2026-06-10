<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

$input = input_json();
$email = strtolower(trim((string) ($input['email'] ?? '')));
$displayName = trim((string) ($input['display_name'] ?? 'Antigravity Player'));

if ($email === '') {
    respond(['error' => 'Email or phone is required'], 422);
}

$stmt = $pdo->prepare('SELECT user_id, display_name, email, wallet FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);
$existing = $stmt->fetch();

if ($existing) {
    respond(['user' => $existing]);
}

$userId = 'AG-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 9));
$wallet = 2500;

$pdo->beginTransaction();
$stmt = $pdo->prepare('INSERT INTO users (user_id, display_name, email, wallet) VALUES (:user_id, :display_name, :email, :wallet)');
$stmt->execute([
    ':user_id' => $userId,
    ':display_name' => $displayName,
    ':email' => $email,
    ':wallet' => $wallet,
]);

$ledger = $pdo->prepare('INSERT INTO wallet_ledger (user_id, delta, reason, reference_id) VALUES (:user_id, :delta, :reason, :reference_id)');
$ledger->execute([
    ':user_id' => $userId,
    ':delta' => $wallet,
    ':reason' => 'initial_virtual_wallet',
    ':reference_id' => 'signup',
]);
$pdo->commit();

respond([
    'user' => [
        'user_id' => $userId,
        'display_name' => $displayName,
        'email' => $email,
        'wallet' => $wallet,
    ],
], 201);