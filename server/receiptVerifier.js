// Minimal receipt verification example
// Usage:
// 1. Set environment variables:
//    - APPLE_SHARED_SECRET (for iOS subscription/shared-secret)
//    - APPLE_USE_SANDBOX=true (during testing)
//    - GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
// 2. Run: `npm install` inside server/ and `npm start`

const express = require('express');
const fetch = require('node-fetch');
const { google } = require('googleapis');

const app = express();
app.use(express.json());

app.post('/verify/ios', async (req, res) => {
  const { receipt } = req.body;
  if (!receipt) return res.status(400).json({ error: 'missing receipt' });

  const secret = process.env.APPLE_SHARED_SECRET || '';
  const endpoint = process.env.APPLE_USE_SANDBOX === 'true'
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'receipt-data': receipt, password: secret })
    });
    const data = await resp.json();
    // data.status === 0 means valid
    return res.json(data);
  } catch (err) {
    console.error('iOS verify error', err);
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/verify/android', async (req, res) => {
  const { packageName, productId, purchaseToken } = req.body;
  if (!packageName || !productId || !purchaseToken) return res.status(400).json({ error: 'missing params' });

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    const client = await auth.getClient();
    const androidpublisher = google.androidpublisher({ version: 'v3', auth: client });

    const r = await androidpublisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken
    });

    // r.data contains purchase state info
    return res.json(r.data || {});
  } catch (err) {
    console.error('android verify error', err);
    return res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Receipt verifier listening on ${PORT}`));
