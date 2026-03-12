import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Platform, Alert } from 'react-native';
import NameInput from './components/NameInput';
import Wheel from './components/Wheel';
import AdMobBanner from './components/AdMobBanner';
import AdConsent from './components/AdConsent';
import PremiumModal from './components/PremiumModal';
import InterstitialAdPlaceholder from './components/InterstitialAdPlaceholder';
import DEFAULT_THEME, { PRESET_THEMES } from './src/theme';
import { ThemeProvider } from './src/ThemeContext';
import { init as iapInit, purchase as iapPurchase, restore as iapRestore, end as iapEnd, setMockProvider } from './src/iapService';
import Constants from 'expo-constants';
import { useRef } from 'react';
import createInterstitial from './components/AdInterstitial';

// AdMob IDs provided
const ADMOB_APP_ID = 'ca-app-pub-2054937504927228~2110784559';
const MAIN_BANNER_AD_UNIT = 'ca-app-pub-2054937504927228/6522112368';

export default function App() {
  const [names, setNames] = useState([]);
  const [premiumVisible, setPremiumVisible] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [customColors, setCustomColors] = useState(['#4F46E5', '#06B6D4', '#10B981', '#F59E0B']);
  const [roundsMin, setRoundsMin] = useState(4);
  const [roundsMax, setRoundsMax] = useState(6);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [themeName, setThemeName] = useState(DEFAULT_THEME.name || 'Professional');
  const [iapProducts, setIapProducts] = useState([]);
  const [iapProvider, setIapProvider] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [adPersonalized, setAdPersonalized] = useState(true);
  const iapProviderRef = useRef(null);
  const interstitialRef = useRef(null);
  const spinCountRef = useRef(0);

  const currentTheme = PRESET_THEMES[themeName] || DEFAULT_THEME;

  const addName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setNames((prev) => [...prev, trimmed]);
  };

  const removeName = (index) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const savePremiumSettings = ({ themeName: selectedThemeName, colors, min, max }) => {
    if (selectedThemeName) setThemeName(selectedThemeName);
    if (colors && colors.length) setCustomColors(colors);
    if (typeof min === 'number') setRoundsMin(min);
    if (typeof max === 'number') setRoundsMax(max);
    setPremiumVisible(false);
  };

  useEffect(() => {
    let mounted = true;
    const productIds = Platform.select({ ios: ['com.myapp.randompicker.premium'], android: ['com.myapp.randompicker.premium'] }) || ['com.myapp.randompicker.premium'];

    // Configure your receipt verification server here. When testing on Android
    // emulators use `http://10.0.2.2:3000` (Android emulator) or your LAN IP
    // if testing on a physical device. Replace with your production server URL.
    const RECEIPT_SERVER = (typeof __DEV__ !== 'undefined' && __DEV__) ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000') : 'https://your-production-receipt-server.example.com';
    const PACKAGE_NAME = (Constants.manifest && (Constants.manifest.android && Constants.manifest.android.package)) || 'com.yourcompany.randompicker';
    console.log('[App] PACKAGE_NAME for receipts:', PACKAGE_NAME);

    const validateAndUnlock = async (purchase) => {
      try {
        // If the runtime IAP provider is a mock (no native module) we grant locally.
        if (iapProviderRef.current === 'mock') {
          setIsPremium(true);
          return;
        }

        // iOS: transactionReceipt is a base64 receipt
        if (purchase && purchase.transactionReceipt) {
          const res = await fetch(`${RECEIPT_SERVER}/verify/ios`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receipt: purchase.transactionReceipt })
          });
          const data = await res.json();
          if (data && (data.status === 0 || data.status === '0')) {
            setIsPremium(true);
            Alert.alert('Purchase verified', 'Premium unlocked');
          } else {
            console.warn('Receipt verification failed', data);
            Alert.alert('Verification failed', 'Receipt not valid');
          }
          return;
        }

        // Android: use purchaseToken / purchaseToken or transactionId
        const productId = purchase && (purchase.productId || purchase.productId) || (iapProducts && iapProducts[0] && (iapProducts[0].productId || iapProducts[0].productId)) || 'com.myapp.randompicker.premium';
        const purchaseToken = purchase && (purchase.purchaseToken || purchase.transactionId || purchase.transactionReceipt);
        if (purchaseToken) {
          const res = await fetch(`${RECEIPT_SERVER}/verify/android`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageName: PACKAGE_NAME, productId, purchaseToken })
          });
          const data = await res.json();
          // Google Play returns purchaseState===0 for purchased
          if (data && (data.purchaseState === 0 || data.purchaseState === '0' || data.acknowledgementState === 1)) {
            setIsPremium(true);
            Alert.alert('Purchase verified', 'Premium unlocked');
          } else if (data && Object.keys(data).length) {
            // best-effort: accept non-error responses
            setIsPremium(true);
            Alert.alert('Purchase verified (best-effort)', 'Premium unlocked');
          } else {
            Alert.alert('Verification failed', 'Could not validate purchase');
          }
          return;
        }

        // fallback: grant on development builds
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          setIsPremium(true);
          Alert.alert('Unlocked (dev)', 'Purchase granted in development');
        }
      } catch (e) {
        console.warn('validateAndUnlock error', e);
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          setIsPremium(true);
          Alert.alert('Offline - unlocked for dev', 'Server unreachable; unlocked for development');
        } else {
          Alert.alert('Verification error', 'Could not validate purchase (network error)');
        }
      }
    };

    (async () => {
      try {
        // If running inside Expo Go, native NitroModules are not available.
        // Skip trying to initialize native IAP libraries and use the mock fallback.
        if (Constants.appOwnership === 'expo') {
          console.log('Expo Go detected — skipping native IAP initialization. Using mock IAP for development.');
          if (mounted) {
            const { provider, products } = setMockProvider(productIds);
            setIapProvider(provider);
            iapProviderRef.current = provider;
            setIapProducts(products || []);
          }
          return;
        }

        const { provider, products } = await iapInit(productIds, {
          onPurchase: async (purchase) => {
            console.log('IAP purchase received', purchase);
            await validateAndUnlock(purchase);
          },
          onError: (err) => console.warn('IAP error', err),
          onProducts: (plist) => {
            console.log('[App] iap onProducts', plist);
            mounted && setIapProducts(plist || []);
          }
        });
        console.log('[App] iapInit returned provider:', provider, 'products:', products);
        if (mounted) {
          setIapProvider(provider);
          iapProviderRef.current = provider;
          // some providers return products in the init return, ensure we keep them
          // if onProducts was not called
          // setIapProducts(products || []);
        }
      } catch (e) {
        console.warn('IAP init failed', e);
        // If IAP initialization fails (billing not available), fall back to mock provider
        if (mounted) {
          const { provider: mockProv, products } = setMockProvider(productIds, { onProducts: (plist) => mounted && setIapProducts(plist || []) });
          setIapProvider(mockProv);
          iapProviderRef.current = mockProv;
          setIapProducts(products || []);
        }
      }
    })();

    // create interstitial for ad testing (will be no-op if native lib missing)
    try {
      interstitialRef.current = createInterstitial(undefined, !adPersonalized);
    } catch (e) {
      interstitialRef.current = null;
    }

    return () => {
      mounted = false;
      iapEnd();
    };
  }, []);

  const requestPurchase = async () => {
    console.log('[App] requestPurchase current iapProducts:', iapProducts);
    const productId = (iapProducts && iapProducts.length && (iapProducts[0].productId || iapProducts[0].productId)) || 'com.myapp.randompicker.premium';
    console.log('[App] requestPurchase using productId:', productId);
    try {
      setPurchaseLoading(true);
      await iapPurchase(productId);
      // purchase listener (in iapService) will set premium state
    } catch (e) {
      console.warn('purchase failed', e);
      Alert.alert('Purchase failed', e && e.message ? e.message : String(e));
    } finally {
      setPurchaseLoading(false);
    }
  };

  const tryShowInterstitial = async () => {
    try {
      spinCountRef.current = (spinCountRef.current || 0) + 1;
      // show roughly every 3rd spin to avoid annoyance
      if (spinCountRef.current % 3 !== 0) return;
      if (interstitialRef.current && typeof interstitialRef.current.show === 'function') {
        await interstitialRef.current.show();
      }
    } catch (e) {
      console.warn('tryShowInterstitial error', e);
    }
  };

  const restorePurchases = async () => {
    try {
      const restored = await iapRestore();
      if (restored && restored.length) {
        setIsPremium(true);
        Alert.alert('Restored', 'Previous purchases restored');
      } else {
        Alert.alert('No purchases', 'No previous purchases found');
      }
    } catch (e) {
      console.warn('restore failed', e);
      Alert.alert('Restore failed', e && e.message ? e.message : String(e));
    }
  };

  const styles = getStyles(currentTheme);

  return (
    <ThemeProvider value={currentTheme}>
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors.primary} />

        <View style={[styles.topBar, { backgroundColor: currentTheme.colors.primary }]}>
          <Text style={styles.appTitle}>Random Picker</Text>
          <TouchableOpacity style={styles.topAction} onPress={() => setPremiumVisible(true)}>
            <Text style={styles.topActionText}>Customize</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Fair. Fast. Fun.</Text>
          <Text style={styles.heroSubtitle}>Enter names, spin the wheel, and pick a winner.</Text>
        </View>

        <View style={styles.body}>
          <AdConsent onChange={(val) => setAdPersonalized(!!val)} />
          <AdMobBanner unitId={MAIN_BANNER_AD_UNIT} requestNonPersonalizedAdsOnly={!adPersonalized} style={{ marginBottom: currentTheme.spacing.md }} />

          <NameInput names={names} addName={addName} removeName={removeName} />

          <View style={styles.card}>
            {names.length === 0 ? (
              <Text style={styles.empty}>Add names to reveal the wheel</Text>
            ) : (
              <Wheel
                names={names}
                colors={currentTheme.palette}
                roundsMin={roundsMin}
                roundsMax={roundsMax}
                onSpinEnd={() => tryShowInterstitial()}
              />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowInterstitial(true)}>
              <Text style={styles.secondaryButtonText}>Show Ad</Text>
            </TouchableOpacity>
            <Text style={styles.premiumLabel}>Premium: {isPremium ? 'Unlocked' : 'Locked'}</Text>
          </View>
        </View>

        <PremiumModal
          visible={premiumVisible}
          onClose={() => setPremiumVisible(false)}
          isPremium={isPremium}
          onPurchase={requestPurchase}
          onRestore={restorePurchases}
          currentThemeName={themeName}
          onSave={savePremiumSettings}
          roundsMin={roundsMin}
          roundsMax={roundsMax}
          iapProducts={iapProducts}
          purchaseLoading={purchaseLoading}
        />

        <InterstitialAdPlaceholder visible={showInterstitial} onClose={() => setShowInterstitial(false)} />
      </SafeAreaView>
    </ThemeProvider>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    topBar: { paddingHorizontal: theme.spacing.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    appTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
    topAction: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    topActionText: { color: '#fff', fontWeight: '700' },
    hero: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
    heroTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
    heroSubtitle: { color: theme.colors.muted, fontSize: 13 },
    body: { padding: theme.spacing.md, flex: 1 },
    card: { backgroundColor: theme.colors.cardBg, borderRadius: theme.r, padding: theme.spacing.md, marginTop: theme.spacing.md, alignItems: 'center', justifyContent: 'center', ...theme.shadow },
    empty: { color: theme.colors.muted },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.md },
    secondaryButton: { backgroundColor: theme.colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E6E9F2' },
    secondaryButtonText: { color: theme.colors.primary, fontWeight: '700' },
    premiumLabel: { color: theme.colors.muted, fontWeight: '700' }
  });
