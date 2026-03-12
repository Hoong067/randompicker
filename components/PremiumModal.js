import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../src/ThemeContext';
import DEFAULT_THEME, { PRESET_THEMES } from '../src/theme';

export default function PremiumModal({ visible, onClose, isPremium, onPurchase, currentThemeName = 'Professional', onSave, roundsMin = 4, roundsMax = 6 }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const [selectedTheme, setSelectedTheme] = useState(currentThemeName);
  const [minText, setMinText] = useState(String(roundsMin));
  const [maxText, setMaxText] = useState(String(roundsMax));

  useEffect(() => {
    setSelectedTheme(currentThemeName);
    setMinText(String(roundsMin));
    setMaxText(String(roundsMax));
  }, [visible]);

  const themeEntries = Object.entries(PRESET_THEMES);

  const handleSave = () => {
    const minVal = Math.max(1, parseInt(minText, 10) || roundsMin);
    const maxVal = Math.max(minVal, parseInt(maxText, 10) || roundsMax);
    onSave({ themeName: selectedTheme, min: minVal, max: maxVal });
  };

  const freeThemeName = DEFAULT_THEME.name || 'Professional';

  const renderTile = ({ item: [name, t] }) => {
    const active = selectedTheme === name;
    const locked = !isPremium && name !== freeThemeName;

    const handlePress = () => {
      if (!locked) setSelectedTheme(name);
    };

    return (
      <TouchableOpacity
        style={[styles.tile, active && styles.tileActive]}
        onPress={handlePress}
        disabled={locked}
        activeOpacity={locked ? 1 : 0.7}
      >
        <View style={styles.tilePalette}>
          {t.palette.slice(0, 5).map((c, i) => (
            <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
          ))}
        </View>
        <Text style={styles.tileLabel}>{name}</Text>

        {locked && (
          <View style={styles.lockOverlay} pointerEvents="none">
            <Text style={styles.lockIcon}>🔒</Text>
            {/* <Text style={styles.lockText}>Locked</Text> */}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Premium Customization</Text>

          {!isPremium ? (
            <>
              <Text style={styles.info}>Unlock UI themes and advanced spin controls.</Text>
              <FlatList data={themeEntries} renderItem={renderTile} keyExtractor={(item) => item[0]} horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} />
              <View style={{ marginTop: 16 }}>
                {/* <TouchableOpacity
                  style={[styles.saveButton, selectedTheme !== freeThemeName && { opacity: 0.5 }]}
                  onPress={() => onSave({ themeName: selectedTheme, min: roundsMin, max: roundsMax })}
                  disabled={selectedTheme !== freeThemeName}
                >
                  <Text style={styles.saveText}>Use Free Theme</Text>
                </TouchableOpacity>
                <View style={{ height: 10 }} /> */}
                <TouchableOpacity style={styles.purchaseButton} onPress={onPurchase}>
                  <Text style={styles.purchaseText}>Purchase Premium (simulate)</Text>
                </TouchableOpacity>
                <View style={{ height: 10 }} />
                <TouchableOpacity style={styles.ghostButton} onPress={onClose}>
                  <Text style={styles.ghostText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.info}>Choose a theme:</Text>
              <FlatList data={themeEntries} renderItem={renderTile} keyExtractor={(item) => item[0]} horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Min rounds</Text>
                  <TextInput style={styles.input} value={minText} onChangeText={setMinText} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Max rounds</Text>
                  <TextInput style={styles.input} value={maxText} onChangeText={setMaxText} keyboardType="numeric" />
                </View>
              </View>

              <View style={{ marginTop: 16 }}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
                <View style={{ height: 8 }} />
                <TouchableOpacity style={styles.ghostButton} onPress={onClose}>
                  <Text style={styles.ghostText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    card: { backgroundColor: theme.colors.surface, padding: 18, borderRadius: 12, width: '94%', ...theme.shadow },
    title: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: theme.colors.text },
    info: { color: theme.colors.muted },
    label: { marginTop: 8, marginBottom: 4, color: theme.colors.text, fontWeight: '700' },
    input: { borderWidth: 1, borderColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff' },
    row: { flexDirection: 'row', alignItems: 'center' },
    purchaseButton: { backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    purchaseText: { color: '#fff', fontWeight: '800' },
    saveButton: { backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '800' },
    ghostButton: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    ghostText: { color: theme.colors.muted },
    tile: { width: 120, height: 92, borderRadius: 10, padding: 8, marginRight: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    tileActive: { borderColor: theme.colors.primary, borderWidth: 2 },
    tilePalette: { flexDirection: 'row', width: '100%', height: 28, borderRadius: 6, overflow: 'hidden' },
    swatch: { flex: 1 },
    tileLabel: { marginTop: 8, fontWeight: '700', color: theme.colors.text }
    ,
    lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    lockIcon: { fontSize: 18, color: '#fff', marginBottom: 6 },
    lockText: { color: '#fff', fontWeight: '800' }
  });
