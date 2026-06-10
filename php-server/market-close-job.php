<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

$markets = [
    '^TWII' => 'https://finance.yahoo.com/quote/%5ETWII/history/',
    '^KS11' => 'https://finance.yahoo.com/quote/%5EKS11/history/',
    '^HSI' => 'https://finance.yahoo.com/quote/%5EHSI/',
    '^BSESN' => 'https://finance.yahoo.com/quote/%5EBSESN/history/',
    '^DJI' => 'https://finance.yahoo.com/quote/%5EDJI/history/',
];

$symbol = (string) ($_GET['symbol'] ?? '^HSI');
if (!array_key_exists($symbol, $markets)) {
    respond(['error' => 'Unknown symbol'], 422);
}

$chartUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/' . rawurlencode($symbol) . '?range=5d&interval=1d';
$raw = @file_get_contents($chartUrl);

if ($raw === false) {
    respond(['error' => 'Unable to fetch Yahoo Finance chart data'], 502);
}

$payload = json_decode($raw, true);
$closes = $payload['chart']['result'][0]['indicators']['quote'][0]['close'] ?? [];
$validCloses = array_values(array_filter($closes, static fn ($close) => is_numeric($close)));

if (!$validCloses) {
    respond(['error' => 'No close price found in Yahoo payload'], 502);
}

$closePrice = (float) end($validCloses);
$formatted = number_format($closePrice, 2, '.', '');
$decimal = substr(explode('.', $formatted)[1] ?? '00', 0, 2);

$stmt = $pdo->prepare('INSERT INTO market_results (symbol, source_url, close_price, result_decimal, raw_payload) VALUES (:symbol, :source_url, :close_price, :result_decimal, :raw_payload)');
$stmt->execute([
    ':symbol' => $symbol,
    ':source_url' => $markets[$symbol],
    ':close_price' => $closePrice,
    ':result_decimal' => $decimal,
    ':raw_payload' => $raw,
]);

respond([
    'symbol' => $symbol,
    'source_url' => $markets[$symbol],
    'close_price' => $formatted,
    'result_decimal' => $decimal,
    'event' => 'market-close-results',
]);