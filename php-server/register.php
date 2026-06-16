<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST required'], 405);
}

// Add referral columns if they don't exist
$pdo->exec("ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT ''");
$pdo->exec("ALTER TABLE users ADD COLUMN referral_code TEXT DEFAULT ''");
$pdo->exec("ALTER TABLE users ADD COLUMN referred_by TEXT DEFAULT NULL");
$pdo->exec("ALTER TABLE users ADD COLUMN referral_earnings INTEGER DEFAULT 0");
$pdo->exec("ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0");
$pdo->exec("ALTER TABLE users ADD COLUMN pending_referral_earnings INTEGER DEFAULT 0");

// Create referral claims table
$pdo->exec("CREATE TABLE IF NOT EXISTS referral_claims (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)");

$input = input_json();
$email = strtolower(trim((string) ($input['email'] ?? '')));
$displayName = trim((string) ($input['display_name'] ?? ''));
$phone = trim((string) ($input['phone'] ?? ''));
$password = (string) ($input['password'] ?? '');
$referralCode = strtoupper(trim((string) ($input['referral_code'] ?? '')));

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

// Validate referral code if provided
$referrerUserId = null;
if (!empty($referralCode)) {
    $refStmt = $pdo->prepare('SELECT user_id FROM users WHERE referral_code = :code');
    $refStmt->execute([':code' => $referralCode]);
    $referrer = $refStmt->fetch();
    if ($referrer) {
        $referrerUserId = $referrer['user_id'];
    }
    // If code is invalid, we still allow registration but don't credit anyone
}

// Generate unique user ID and referral code
$userId = 'M90-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 9));
$cleanName = preg_replace('/[^a-zA-Z]/', '', $displayName);
$namePrefix = strtoupper(substr($cleanName ?: 'USER', 0, 4));
$randomSuffix = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
$newReferralCode = $namePrefix . $randomSuffix;

// Make sure referral code is unique
$checkStmt = $pdo->prepare('SELECT user_id FROM users WHERE referral_code = :code');
$checkStmt->execute([':code' => $newReferralCode]);
while ($checkStmt->fetch()) {
    $randomSuffix = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
    $newReferralCode = $namePrefix . $randomSuffix;
    $checkStmt->execute([':code' => $newReferralCode]);
}

// Insert new user
$insert = $pdo->prepare('INSERT INTO users (user_id, display_name, email, wallet, password_hash, referral_code, referred_by, referral_earnings, referral_count, pending_referral_earnings) VALUES (:user_id, :display_name, :email, :wallet, :password_hash, :referral_code, :referred_by, 0, 0, 0)');
$insert->execute([
    ':user_id' => $userId,
    ':display_name' => $displayName !== '' ? $displayName : 'Market 90x Player',
    ':email' => $email,
    ':wallet' => 2500,
    ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ':referral_code' => $newReferralCode,
    ':referred_by' => $referrerUserId,
]);

// Credit ₹50 to referrer (as pending - admin must approve)
if ($referrerUserId) {
    $creditStmt = $pdo->prepare('UPDATE users SET pending_referral_earnings = pending_referral_earnings + 50, referral_count = referral_count + 1 WHERE user_id = :user_id');
    $creditStmt->execute([':user_id' => $referrerUserId]);
}

respond([
    'user_id' => $userId, 
    'status' => 'registered',
    'referral_code' => $newReferralCode,
    'referred_by' => $referrerUserId
], 201);