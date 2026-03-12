import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { useTheme } from '../src/ThemeContext';

export default function InterstitialAdPlaceholder({ visible, onClose }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Sponsored Content</Text>
          <Text style={styles.text}>This is a simulated full-screen interstitial ad.</Text>
          <View style={{ marginTop: 12 }}>
            <Button title="Close" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
    card: { backgroundColor: theme.colors.surface, padding: 22, borderRadius: 12, width: '86%', alignItems: 'center', ...theme.shadow },
    title: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: theme.colors.text },
    text: { color: theme.colors.muted }
  });
