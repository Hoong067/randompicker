# Receipt Verification Server

This is a minimal example server that demonstrates how to verify receipts from Apple and Google.

Setup

1. cd into `server/` and install dependencies:

```bash
cd server
npm install
```

2. Set required environment variables:

- `APPLE_SHARED_SECRET` — App Store shared secret (if required, for subscriptions)
- `APPLE_USE_SANDBOX=true` — during testing
- `GOOGLE_APPLICATION_CREDENTIALS` — path to a Google service-account JSON file with access to the Play Developer API

Run

```bash
npm start
```

Endpoints

- `POST /verify/ios` — JSON body: `{ receipt: '<base64-receipt>' }` — returns App Store verification JSON
- `POST /verify/android` — JSON body: `{ packageName, productId, purchaseToken }` — returns Google Play purchase data

Security

This example is intentionally minimal. For production:
- Validate and sanitize inputs
- Use HTTPS
- Store and validate entitlements in a secure database
- Use purchase tokens and server-side logic to prevent replay/spoofing
