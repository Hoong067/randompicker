import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Text, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from '../src/ThemeContext';

export default function NameInput({ names, addName, removeName }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [text, setText] = useState('');

  const onAdd = () => {
    const t = text.trim();
    if (!t) return;
    addName(t);
    setText('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a name"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          onSubmitEditing={onAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal contentContainerStyle={styles.chips} showsHorizontalScrollIndicator={false}>
        {names.map((item, index) => (
          <View key={index.toString()} style={styles.chip}>
            <Text numberOfLines={1} style={styles.chipText}>{item}</Text>
            <TouchableOpacity onPress={() => removeName(index)} style={styles.chipRemove}>
              <Text style={styles.chipRemoveText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: { marginTop: theme.spacing.sm },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, backgroundColor: theme.colors.surface, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EEF2FF', color: theme.colors.text },
    addButton: { marginLeft: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
    addButtonText: { color: '#fff', fontWeight: '700' },
    chips: { paddingVertical: 12 },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.chipBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
    chipText: { color: theme.colors.primary, maxWidth: 120 },
    chipRemove: { marginLeft: 8, backgroundColor: theme.colors.surface, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
    chipRemoveText: { color: theme.colors.danger, fontWeight: '700' }
  });
