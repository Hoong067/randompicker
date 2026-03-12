# app.json / native config examples

Below are example snippets you may add to your `app.json` or native configs when integrating AdMob / IAP. Do not paste these directly into `app.json` if you already have keys—merge carefully.

## Android - add AdMob App ID to AndroidManifest (native)

Add this inside the `<application>` tag of `android/app/src/main/AndroidManifest.xml` in a bare or prebuilt project:

```xml
<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
           android:value="ca-app-pub-XXXXXXXX~YYYYYYYY"/>
```

Replace `ca-app-pub-XXXXXXXX~YYYYYYYY` with your AdMob App ID.

### Example (your provided IDs)

For this project the AdMob IDs provided are:

- App ID: `ca-app-pub-2054937504927228~2110784559`
- Banner ad unit: `ca-app-pub-2054937504927228/6522112368`

Apply the App ID to AndroidManifest (inside `<application>`) and Info.plist as shown above, and use the banner ad unit for the `BannerAd` component in the app.

## iOS - add AdMob App ID to Info.plist (native)

Add this to `ios/<YourApp>/Info.plist`:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXX~YYYYYYYY</string>
```

## app.json snippets for `expo.buildProperties` (optional)

You can also define `expo.buildProperties` or `expo.android`/`expo.ios` fields for EAS builds. Example:

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.randompicker",
      "versionCode": 2
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.randompicker"
    }
  }
}
```

Note: EAS prebuild will merge these into native projects when you run `eas build`.
