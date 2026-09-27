import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors, sizes } from '@/theme';

/** Simple stand-in mark (a house on the brand green); the real logo asset isn't copied. */
export function LogoMark({ size = sizes.logo }: { size?: number }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.25 }]} accessibilityLabel="PadosiPro">
      <Feather name="home" size={size * 0.46} color={colors.textOnPrimary} />
      <View style={[styles.dot, { width: size * 0.16, height: size * 0.16, borderRadius: size }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: '18%', right: '18%', backgroundColor: colors.accent },
});
