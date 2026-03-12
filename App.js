import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import NameInput from './components/NameInput';
import Wheel from './components/Wheel';
import AdBannerPlaceholder from './components/AdBannerPlaceholder';
import PremiumModal from './components/PremiumModal';
import InterstitialAdPlaceholder from './components/InterstitialAdPlaceholder';
import DEFAULT_THEME, { PRESET_THEMES } from './src/theme';
import { ThemeProvider } from './src/ThemeContext';

export default function App() {
  const [names, setNames] = useState([]);
  const [premiumVisible, setPremiumVisible] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [customColors, setCustomColors] = useState(['#4F46E5', '#06B6D4', '#10B981', '#F59E0B']);
  const [roundsMin, setRoundsMin] = useState(4);
  const [roundsMax, setRoundsMax] = useState(6);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [themeName, setThemeName] = useState(DEFAULT_THEME.name || 'Professional');

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

  const purchasePremium = () => {
    setIsPremium(true);
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
          <AdBannerPlaceholder />

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
          onPurchase={purchasePremium}
          currentThemeName={themeName}
          onSave={savePremiumSettings}
          roundsMin={roundsMin}
          roundsMax={roundsMax}
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
