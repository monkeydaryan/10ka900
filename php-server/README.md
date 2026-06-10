# Antigravity Local PHP Server

This folder is a local PHP API scaffold for the Antigravity prototype.

## Run Locally

1. Start the Vite app in one terminal.
2. Start PHP from the project root with:

```bash
php -S localhost:8080 -t php-server
```

3. Use these endpoints from the front end or Postman:

```text
POST http://localhost:8080/user-login.php
POST http://localhost:8080/admin-login.php
GET  http://localhost:8080/credit-request.php
POST http://localhost:8080/credit-request.php
POST http://localhost:8080/admin-grant-credit.php
GET  http://localhost:8080/market-close-job.php?symbol=%5EHSI
```

## Default Admin

The local PHP server seeds an initial admin account on first run. For local development, the seeded admin username is `admin` and the password is configured in `php-server/config.php`.

Change the seeded admin password before using this beyond local development.

## Storage

The API creates `antigravity.sqlite` automatically and stores users, admin users, credit requests, wallet ledger entries, and captured market results.