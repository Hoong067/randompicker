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
