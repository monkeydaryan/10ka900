<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

$input = input_json();
$to = trim((string) ($input['to'] ?? 'gillparamveer24@gmail.com'));
$subject = trim((string) ($input['subject'] ?? 'Market 90x notification'));
$body = (string) ($input['body'] ?? '');

if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'Invalid recipient email'], 422);
}

$pdo->exec("CREATE TABLE IF NOT EXISTS owner_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  delivered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)");

// Free delivery: PHP mail() via local MTA, or swap in PHPMailer with a Gmail SMTP app password.
$delivered = @mail($to, $subject, $body, 'From: no-reply@market90x.local');

$stmt = $pdo->prepare('INSERT INTO owner_notifications (recipient, subject, body, delivered) VALUES (:recipient, :subject, :body, :delivered)');
$stmt->execute([
    ':recipient' => $to,
    ':subject' => $subject,
    ':body' => $body,
    ':delivered' => $delivered ? 1 : 0,
]);

respond(['status' => 'logged', 'delivered' => (bool) $delivered]);
