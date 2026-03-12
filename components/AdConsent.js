import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

// Try to use AsyncStorage if available, otherwise fall back to non-persistent state
let AsyncStorage = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

let mobileAds = null;
let TestIds = null;
try {
  let adm = null;
  try {
    adm = require('react-native-google-mobile-ads/lib/commonjs');
  } catch (e) {
    adm = require('react-native-google-mobile-ads');
  }
  mobileAds = adm.default || adm;
  TestIds = adm.TestIds || (mobileAds && mobileAds.TestIds);
} catch (e) {
  mobileAds = null;
}

const STORAGE_KEY = 'rp.ad.personalized';

export default function AdConsent({ onChange }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let stored = null;
        if (AsyncStorage) {
          const v = await AsyncStorage.getItem(STORAGE_KEY);
          if (v !== null) stored = v === '1';
        }
        if (!mounted) return;
        if (stored === null) {
          setVisible(true);
        } else {
          onChange && onChange(stored);
        }
      } catch (e) {
        if (!mounted) return;
        setVisible(true);
      }

      // Set a safe default test device identifier for development if the native
      // mobileAds module is available (EMULATOR). This helps ensure test ads.
      if (mobileAds) {
        try {
          const ids = (TestIds && TestIds.EMULATOR) ? [TestIds.EMULATOR] : ['EMULATOR'];
          mobileAds().setRequestConfiguration({ testDeviceIdentifiers: ids }).then(() => {
            console.log('AdMob test device ids set', ids);
          }).catch(() => {});
        } catch (e) {
          console.warn('AdConsent: setRequestConfiguration failed', e);
        }
      }
    })();
    return () => (mounted = false);
  }, []);

  const save = async (personalized) => {
    try {
      if (AsyncStorage) await AsyncStorage.setItem(STORAGE_KEY, personalized ? '1' : '0');
    } catch (e) {
      console.warn('AdConsent: save error', e);
    }
    setVisible(false);
    onChange && onChange(personalized);
  };

  if (!visible) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ad preferences</Text>
      <Text style={styles.message}>We show ads to support the app. Choose whether you prefer personalized ads (better relevance) or non-personalized ads (privacy-friendly).</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => save(false)}>
          <Text style={styles.btnText}>Non-personalized</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => save(true)}>
          <Text style={[styles.btnText, styles.btnTextPrimary]}>Personalized</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.link} onPress={() => Linking.openURL('https://policies.google.com/privacy')}>Privacy & policy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  title: { fontWeight: '700', marginBottom: 6 },
  message: { fontSize: 13, color: '#333', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, alignItems: 'center' },
  primary: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  btnText: { fontWeight: '700' },
  btnTextPrimary: { color: '#fff' },
  link: { marginTop: 8, color: '#2563EB', textDecorationLine: 'underline', fontSize: 13 }
});
