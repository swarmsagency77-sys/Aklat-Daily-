import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, Text, styles as ui } from '@/components/ui';
import { colors, fonts } from '@/lib/theme';

const STICKERS: [string, number, number, number][] = [
  ['محشي', 8, 14, -6], ['ملوخية', 58, 8, 5], ['بيتزا', 66, 64, -4], ['كشري', 6, 66, 7], ['مسقعة', 36, 82, -3],
];

export default function Welcome() {
  return (
    <Screen>
      <View style={s.art} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={s.plate} />
        {STICKERS.map(([name, x, y, r]) => (
          <View key={name} style={[s.sticker, { start: `${x}%`, top: `${y}%`, transform: [{ rotate: `${r}deg` }] }]}>
            <Text weight="bold">{name}</Text>
          </View>
        ))}
        <View style={s.question}>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.white }}>هناكل إيه؟</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
        <Text style={[ui.display, { fontSize: 56, lineHeight: 70, color: colors.orange }]}>أكلات</Text>
        <Text weight="bold" style={{ fontSize: 22, color: colors.green }}>daily</Text>
      </View>
      <Text style={{ color: colors.muted, fontSize: 16 }}>
        مساعدك الشخصي للأكل. قولنا إنتو بتحبوا إيه، وإحنا نقولك هتاكلوا إيه النهاردة وطول الأسبوع، ونفكّرك بالدوا والمياه والتحضير.
      </Text>
      <Button title="يلا نبدأ" onPress={() => router.push('/signup')} style={{ marginTop: 8 }} />
      <Button title="عندي حساب، سجّل دخول" kind="quiet" onPress={() => router.push('/login')} />
      <Text style={{ textAlign: 'center', color: colors.green, fontFamily: fonts.display, fontSize: 20, marginTop: 8 }}>
        من هناكل إيه؟ لـ يلا ناكل
      </Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  art: { height: 250, borderRadius: 28, backgroundColor: colors.orange, overflow: 'hidden' },
  plate: {
    position: 'absolute', width: 190, height: 190, borderRadius: 95, alignSelf: 'center', top: 30,
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 18, borderColor: 'rgba(255,255,255,0.10)',
  },
  sticker: { position: 'absolute', backgroundColor: colors.card, borderRadius: 99, paddingVertical: 5, paddingHorizontal: 14 },
  question: {
    position: 'absolute', alignSelf: 'center', top: 98, backgroundColor: colors.green, borderRadius: 99,
    paddingVertical: 4, paddingHorizontal: 16, transform: [{ rotate: '-3deg' }],
  },
});
