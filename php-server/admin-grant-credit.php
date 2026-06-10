<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

$input = input_json();
$requestId = trim((string) ($input['request_id'] ?? ''));
$credits = (int) ($input['credits'] ?? 0);

if ($requestId === '' || $credits <= 0) {
    respond(['error' => 'request_id and credits are required'], 422);
}

$stmt = $pdo->prepare('SELECT * FROM credit_requests WHERE request_id = :request_id');
$stmt->execute([':request_id' => $requestId]);
$request = $stmt->fetch();

if (!$request) {
    respond(['error' => 'Credit request not found'], 404);
}

if ($request['status'] !== 'pending') {
    respond(['error' => 'Credit request already processed'], 409);
}

$pdo->beginTransaction();
$updateUser = $pdo->prepare('UPDATE users SET wallet = wallet + :credits WHERE user_id = :user_id');
$updateUser->execute([':credits' => $credits, ':user_id' => $request['user_id']]);

$updateRequest = $pdo->prepare("UPDATE credit_requests SET requested_credits = :credits, status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE request_id = :request_id");
$updateRequest->execute([':credits' => $credits, ':request_id' => $requestId]);

$ledger = $pdo->prepare('INSERT INTO wallet_ledger (user_id, delta, reason, reference_id) VALUES (:user_id, :delta, :reason, :reference_id)');
$ledger->execute([
    ':user_id' => $request['user_id'],
    ':delta' => $credits,
    ':reason' => 'admin_verified_qr_deposit',
    ':reference_id' => $request['transaction_id'],
]);
$pdo->commit();

respond(['status' => 'approved', 'user_id' => $request['user_id'], 'credits' => $credits]);