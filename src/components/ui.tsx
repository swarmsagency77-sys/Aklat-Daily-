import { ReactNode } from 'react';
import {
  Pressable, ScrollView, StyleProp, StyleSheet, Text as RNText, TextInput, TextProps, TextStyle, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '@/lib/theme';

export function Text({ style, weight = 'body', ...p }: TextProps & { weight?: keyof typeof fonts }) {
  return <RNText {...p} style={[styles.text, { fontFamily: fonts[weight] }, style]} />;
}

export function Screen({ children, scroll = true, style }: { children: ReactNode; scroll?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.pad, style]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.pad, { flex: 1 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

type BtnKind = 'primary' | 'green' | 'quiet' | 'outline' | 'light';
export function Button({
  title, onPress, kind = 'primary', disabled, style, small,
}: { title: string; onPress?: () => void; kind?: BtnKind; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean }) {
  const bg = { primary: colors.orange, green: colors.green, quiet: colors.greenSoft, outline: colors.card, light: colors.white }[kind];
  const fg = { primary: colors.white, green: colors.white, quiet: colors.green, outline: colors.ink, light: colors.orangeInk }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        kind === 'outline' && { borderWidth: 1, borderColor: colors.line },
        style,
      ]}
    >
      <Text weight="bold" style={{ color: fg, fontSize: small ? 13 : 15 }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, on, onPress, negative }: { label: string; on: boolean; onPress: () => void; negative?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[
        styles.chip,
        on && (negative ? { backgroundColor: colors.orangeSoft, borderColor: colors.orange } : { backgroundColor: colors.green, borderColor: colors.green }),
      ]}
    >
      <Text
        weight="medium"
        style={[{ fontSize: 13 }, on && { color: negative ? colors.orangeInk : colors.white }, on && negative && { textDecorationLine: 'line-through' }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Chips({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

export function Field({
  label, error, style, ...p
}: React.ComponentProps<typeof TextInput> & { label: string; error?: string }) {
  return (
    <View style={{ gap: 5 }}>
      <Text weight="bold" style={{ fontSize: 13 }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...p}
        style={[styles.input, !!error && { borderColor: colors.orangeInk }, style as StyleProp<TextStyle>]}
      />
      {!!error && <Text weight="medium" style={{ color: colors.orangeInk, fontSize: 12 }}>{error}</Text>}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text weight="bold" style={styles.section}>{children}</Text>;
}

export const styles = StyleSheet.create({
  text: { color: colors.ink, fontSize: 15, writingDirection: 'rtl' },
  screen: { flex: 1, backgroundColor: colors.ivory },
  pad: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 12 },
  btn: { borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.sm },
  chip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.ivory, borderRadius: 99, paddingVertical: 5, paddingHorizontal: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  input: {
    borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.body, fontSize: 15, color: colors.ink, writingDirection: 'rtl',
  },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, gap: 8 },
  section: { color: colors.muted, fontSize: 13, marginTop: 12 },
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 46, color: colors.ink },
});
