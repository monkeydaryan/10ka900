<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = $pdo->query('SELECT * FROM credit_requests ORDER BY created_at DESC')->fetchAll();
    respond(['requests' => $rows]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'GET or POST required'], 405);
}

$input = input_json();
$userId = strtoupper(trim((string) ($input['user_id'] ?? '')));
$transactionId = strtoupper(trim((string) ($input['transaction_id'] ?? '')));
$requestedCredits = (int) ($input['requested_credits'] ?? 0);

if ($userId === '' || $transactionId === '' || $requestedCredits <= 0) {
    respond(['error' => 'user_id, transaction_id, and requested_credits are required'], 422);
}

$userStmt = $pdo->prepare('SELECT user_id FROM users WHERE user_id = :user_id');
$userStmt->execute([':user_id' => $userId]);
if (!$userStmt->fetch()) {
    respond(['error' => 'Unknown user_id'], 404);
}

$requestId = unique_id('CR');
$stmt = $pdo->prepare('INSERT INTO credit_requests (request_id, user_id, transaction_id, requested_credits) VALUES (:request_id, :user_id, :transaction_id, :requested_credits)');
$stmt->execute([
    ':request_id' => $requestId,
    ':user_id' => $userId,
    ':transaction_id' => $transactionId,
    ':requested_credits' => $requestedCredits,
]);

respond(['request_id' => $requestId, 'status' => 'pending'], 201);