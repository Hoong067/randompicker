# Random Picker (Expo SDK 54)

Small Expo + React Native example: enter names, spin a wheel, get a random selection.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Start the dev server and open with Expo Go on your device:

```bash
npx expo start
```

Notes
- This project is scaffolded for Expo SDK 54. Use Expo Go to preview on a device.
- `react-native-svg` is used to draw the wheel.
- Ads and premium features are placeholders; integrating real ad networks requires native configuration and keys.

Monetization & Premium
- The app includes UI placeholders for a banner ad and an interstitial ad (`components/AdBannerPlaceholder.js`, `components/InterstitialAdPlaceholder.js`). These are UI-only and do not display real ads.
- To integrate real ads in an Expo managed workflow you have two main approaches:
	- Use a custom dev/client or EAS build with `react-native-google-mobile-ads` (recommended for production). This requires native setup (Android/iOS) and adding your AdMob App ID in native configs.
	- For older Expo SDKs, `expo-ads-admob` existed but full support varies; prefer the native module above.
- For in-app purchases (premium unlock) test flows, use `expo-in-app-purchases` or `react-native-iap` with EAS/production builds. Simulated purchase in this repo is a placeholder (`components/PremiumModal.js`).

Testing the placeholders
- Start the app and open the `Customize` button to open the premium modal. Use the "Purchase Premium (simulate)" button to unlock customization for testing.
- Use the "Show Interstitial Ad" button to view the simulated interstitial modal.

Production notes
- Real AdMob and IAP integration require native binaries and proper app IDs / store configuration. Build with EAS or use a custom development client when adding native modules.

In-app purchases (IAP)
----------------------

This repo includes a small IAP wiring helper (`src/iapService.js`) that will try to use `react-native-iap` or `expo-in-app-purchases` if installed, and falls back to a mock implementation for local dev. For real purchases you must:

- Create a paid product in App Store Connect and Google Play Console (non-consumable, e.g. `com.myapp.randompicker.premium`).
- Install a native IAP library and build a development client or an EAS build — Expo Go cannot load native IAP modules.

Quick install and build (recommended using EAS):

```bash
# install a library (pick one)
npm install react-native-iap
# or
npm install expo-in-app-purchases

# install expo dev client to test native modules
npx expo install expo-dev-client

# build a development client (requires eas-cli configured)
npx eas build --profile development --platform android
npx eas build --profile development --platform ios

# then start the dev client workflow
npx expo start --dev-client
```

Client-side notes
- Initialize the library at app startup and fetch product metadata (price/title).
- Call `requestPurchase(productId)` when the user confirms purchase.
- Listen for purchase updates and acknowledge/finish the transaction.
- Use `getAvailablePurchases()` / `getPurchaseHistoryAsync()` to implement "Restore purchases".

Server-side receipt validation (recommended)
- iOS: verify receipts with App Store `verifyReceipt` endpoint or the App Store Server API. Use the shared secret for auto-renewables.
- Android: validate purchase tokens using Google Play Developer API (requires service account).

Minimal Node.js example (conceptual)

```js
// Express example for simple receipt verification (very high level)
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// iOS receipt verification (server-to-server)
app.post('/verify/ios', async (req, res) => {
	const { receipt } = req.body;
	const response = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
		method: 'POST', body: JSON.stringify({ 'receipt-data': receipt, password: process.env.APPLE_SHARED_SECRET })
	});
	const body = await response.json();
	// inspect body.status and latest_receipt_info
	res.json(body);
});

// Android: use Google Play Developer API (requires OAuth service account) - use googleapis client
app.post('/verify/android', async (req, res) => {
	// receive purchaseToken and productId, then call Google API to validate
	res.json({ ok: true });
});

app.listen(3000);
```

Security: Always validate purchases server-side when possible to prevent spoofed receipts and to securely store user entitlements.

AdMob integration & testing
--------------------------

This project now includes a conditional `AdMobBanner` component (`components/AdMobBanner.js`) and a small consent UI (`components/AdConsent.js`) to let users choose personalized vs non-personalized ads. Important notes to integrate and test real ads:

1) Install the native AdMob SDK wrapper and native dependencies:

```bash
npm install react-native-google-mobile-ads
npx pod-install ios    # macOS / iOS only
```

2) Add your provided AdMob App ID to native config (copy/paste examples in `docs/android-admob-snippet.xml` and `docs/ios-admob-snippet.plist`). For example:

Android (inside `<application>`):

```xml
<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
		   android:value="ca-app-pub-2054937504927228~2110784559"/>
```

iOS (Info.plist):

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-2054937504927228~2110784559</string>
```

3) Build a development client so native modules load (Expo Go cannot load the AdMob native SDK):

```bash
# build a dev-client (example Android)
npx eas build --profile development --platform android
npx expo start --dev-client
```

4) Use test ads during development
- The project sets `TestIds.EMULATOR` as a test device identifier when the native mobile-ads SDK is present.
- In dev the `AdMobBanner` will use the test banner id automatically when `__DEV__` is true.
- You can also set test device ids manually in JS:

```js
import mobileAds from 'react-native-google-mobile-ads';
mobileAds().setRequestConfiguration({ testDeviceIdentifiers: ['EMULATOR'] });
```

5) GDPR / consent
- The included `AdConsent` component prompts users once and stores their preference (when `@react-native-async-storage/async-storage` is available). The `AdMobBanner` will request non-personalized ads when the user chooses that option.

6) Troubleshooting
- If the banner fails to load, check native initialization logs and make sure the App ID is set in the native manifest/Info.plist and that you are running a dev-client or production build.
- Do not click your own live ads; always use test IDs or register your device as a test device.

Policy reminders
- Read and follow AdMob policies for placement and disallowed behavior (no accidental-click patterns, clear UX around ads, privacy disclosures).


