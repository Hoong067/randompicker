// Lightweight interstitial helper that uses react-native-google-mobile-ads when available.
let InterstitialAdLib = null;
let AdEventType = null;
let TestIds = null;

try {
  let adm = null;
  try {
    adm = require('react-native-google-mobile-ads/lib/commonjs');
  } catch (e) {
    adm = require('react-native-google-mobile-ads');
  }
  InterstitialAdLib = adm.InterstitialAd;
  AdEventType = adm.AdEventType;
  TestIds = adm.TestIds;
} catch (e) {
  InterstitialAdLib = null;
}

export default function createInterstitial(unitId, requestNonPersonalizedAdsOnly = true) {
  if (!InterstitialAdLib) {
    return {
      load: async () => {},
      show: async () => {},
      isLoaded: () => false,
      destroy: () => {}
    };
  }

  const resolvedUnitId = (__DEV__ && TestIds && TestIds.INTERSTITIAL) ? TestIds.INTERSTITIAL : (unitId || TestIds.INTERSTITIAL);
  const ad = InterstitialAdLib.createForAdRequest(resolvedUnitId, { requestNonPersonalizedAdsOnly });
  let loaded = false;
  const removers = [];

  function add(type, cb) {
    try {
      const off = ad.addAdEventListener(type, cb);
      if (typeof off === 'function') removers.push(off);
      return off;
    } catch (e) {
      return () => {};
    }
  }

  add(AdEventType.LOADED, () => { loaded = true; });
  add(AdEventType.CLOSED, () => { loaded = false; });
  add(AdEventType.ERROR, (err) => { loaded = false; console.warn('Interstitial error', err); });

  return {
    load: () => { loaded = false; try { ad.load(); } catch (e) {} },
    show: () => new Promise((resolve) => {
      if (loaded) {
        try { ad.show(); } catch (e) { console.warn('Interstitial show error', e); }
        return resolve(true);
      }
      // wait for loaded event then show
      const off = add(AdEventType.LOADED, () => {
        try { ad.show(); } catch (e) { console.warn('Interstitial show after load error', e); }
        resolve(true);
        if (typeof off === 'function') off();
      });
      try { ad.load(); } catch (e) { console.warn('Interstitial load error', e); resolve(false); }
    }),
    isLoaded: () => loaded,
    destroy: () => { removers.forEach((r) => { try { r(); } catch (e) {} }); }
  };
}
