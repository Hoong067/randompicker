import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, Button, Text as RNText, Dimensions, Easing } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../src/ThemeContext';

const { width } = Dimensions.get('window');

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const d = ['M', cx, cy, 'L', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' ');
  return d;
}

const COLORS = ['#FF7F50', '#FFB6C1', '#FFD700', '#87CEFA', '#98FB98', '#DDA0DD', '#FFA07A', '#B0E0E6'];

export default function Wheel({ names = [], colors, roundsMin = 4, roundsMax = 6, onSpinEnd }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  const spin = () => {
    if (spinning || names.length === 0) return;
    setSpinning(true);

    const segmentAngle = 360 / names.length;
    const chosen = Math.floor(Math.random() * names.length);
    const midAngle = chosen * segmentAngle + segmentAngle / 2;
    const rounds = Math.floor(Math.random() * (roundsMax - roundsMin + 1)) + roundsMin; // configurable full turns
    const offset = (Math.random() - 0.5) * (segmentAngle * 0.6);
    const finalDeg = rounds * 360 + (360 - midAngle) + offset;

    Animated.timing(rotation, {
      toValue: finalDeg,
      duration: 4200 + rounds * 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const winnerName = names[chosen];
      setWinner(winnerName);
      setSpinning(false);
      // keep rotation value normalized
      const normalized = finalDeg % 360;
      rotation.setValue(normalized);
      if (typeof onSpinEnd === 'function') {
        try { onSpinEnd(winnerName); } catch (e) { console.warn('onSpinEnd error', e); }
      }
    });
  };

  const size = Math.min(width - theme.spacing.lg, 380);
  const cx = size / 2;
  const r = size / 2;

  const rotateInterpolate = rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }], width: size, height: size }}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {names.map((name, i) => {
              const start = i * (360 / names.length);
              const end = start + 360 / names.length;
              const path = describeArc(cx, cx, r, start, end);
              const mid = start + (end - start) / 2;
              const labelPos = polarToCartesian(cx, cx, r * 0.62, mid);
              const usedColors = colors && colors.length ? colors : COLORS;

              return (
                <G key={`seg-${i}`}>
                  <Path d={path} fill={usedColors[i % usedColors.length]} stroke="#fff" strokeWidth={1} />
                  <SvgText x={labelPos.x} y={labelPos.y} fill={theme.colors.text} fontSize={12} textAnchor="middle">
                    {name}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Animated.View>

        <View style={styles.pointer} />
      </View>

      <TouchableOpacity style={[styles.button, spinning && styles.buttonDisabled]} onPress={spin} disabled={spinning}>
        <RNText style={styles.buttonText}>{spinning ? 'Spinning...' : 'Spin'}</RNText>
      </TouchableOpacity>

      <Modal visible={!!winner} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <RNText style={styles.winnerTitle}>Winner</RNText>
            <RNText style={[styles.winnerName, { color: theme.colors.danger }]}>{winner}</RNText>
            <View style={{ marginTop: 12 }}>
              <Button title="Close" onPress={() => setWinner(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: { alignItems: 'center' },
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.r, padding: theme.spacing.md, ...theme.shadow },
    pointer: {
      position: 'absolute',
      top: 8,
      left: '50%',
      marginLeft: -14,
      width: 0,
      height: 0,
      borderLeftWidth: 14,
      borderRightWidth: 14,
      borderBottomWidth: 22,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: theme.colors.danger,
      zIndex: 10,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8
    },
    button: {
      marginTop: 12,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 12,
      alignSelf: 'center'
    },
    buttonDisabled: { backgroundColor: '#A5B4FC' },
    buttonText: { color: '#fff', fontWeight: '800', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
    modalCard: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '80%', alignItems: 'center' },
    winnerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    winnerName: { fontSize: 22, fontWeight: '800' }
  });
