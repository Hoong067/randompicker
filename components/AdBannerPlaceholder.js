import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/ThemeContext';

export default function AdBannerPlaceholder() {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.banner}>
      <Text style={styles.label}>Sponsored</Text>
      <Text style={styles.text}>Banner Ad Placeholder</Text>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    banner: {
      height: 72,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#EEF2FF',
      ...theme.shadow
    },
    label: { fontSize: 11, color: theme.colors.muted, fontWeight: '700' },
    text: { color: theme.colors.muted }
  });
