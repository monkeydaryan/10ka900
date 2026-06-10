<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

$input = input_json();
$destination = trim((string) ($input['destination'] ?? ''));
$otp = trim((string) ($input['otp'] ?? ''));
$channel = (string) ($input['channel'] ?? 'email');

if ($destination === '' || !preg_match('/^\d{6}$/', $otp)) {
    respond(['error' => 'destination and 6-digit otp are required'], 422);
}

$pdo->exec("CREATE TABLE IF NOT EXISTS otp_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  destination TEXT NOT NULL,
  channel TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)");

$stmt = $pdo->prepare('INSERT INTO otp_log (destination, channel, otp_hash) VALUES (:destination, :channel, :otp_hash)');
$stmt->execute([
    ':destination' => $destination,
    ':channel' => $channel,
    ':otp_hash' => password_hash($otp, PASSWORD_DEFAULT),
]);

$delivered = false;
if ($channel === 'email') {
    // Free option: PHP mail() with a configured local MTA, or PHPMailer + Gmail SMTP app password.
    $delivered = @mail(
        $destination,
        'Your Market 90x OTP',
        "Your Market 90x one-time password is: {$otp}\nIt expires in 5 minutes.",
        'From: no-reply@market90x.local'
    );
}
// Free option for SMS: Firebase Phone Auth (client-side, free tier) — no server send needed.

respond(['status' => 'queued', 'channel' => $channel, 'delivered' => (bool) $delivered]);
