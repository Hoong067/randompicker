import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AdBannerPlaceholder from './AdBannerPlaceholder';

let mobileAds = null;
let BannerAd = null;
let BannerAdSize = null;
let TestIds = null;

try {
  // Prefer the compiled commonjs build to avoid Metro attempting to resolve
  // TypeScript sources in `src/` (some environments cannot resolve .ts in node_modules).
  let adm = null;
  try {
    adm = require('react-native-google-mobile-ads/lib/commonjs');
  } catch (e) {
    adm = require('react-native-google-mobile-ads');
  }
  mobileAds = adm.default || adm;
  BannerAd = adm.BannerAd || (mobileAds && mobileAds.BannerAd);
  BannerAdSize = adm.BannerAdSize || (mobileAds && mobileAds.BannerAdSize);
  TestIds = adm.TestIds || (mobileAds && mobileAds.TestIds);
} catch (e) {
  mobileAds = null;
}

export default function AdMobBanner({ unitId, style, requestNonPersonalizedAdsOnly = true }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!mobileAds) return setInitialized(true);
    try {
      mobileAds()
        .initialize()
        .then(() => setInitialized(true))
        .catch(() => setInitialized(true));
    } catch (e) {
      console.warn('mobileAds.initialize error', e);
      setInitialized(true);
    }
  }, []);

  if (!initialized) return null;
  if (!mobileAds || !BannerAd) return <AdBannerPlaceholder />;

  const resolvedUnitId = (__DEV__ && TestIds && TestIds.BANNER) ? TestIds.BANNER : unitId;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={resolvedUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly }}
        onAdLoaded={() => console.log('Banner loaded')}
        onAdFailedToLoad={(err) => console.warn('Banner failed to load', err)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' }
});
