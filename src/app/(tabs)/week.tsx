import { View } from 'react-native';
import { Button, Card, Screen, Text } from '@/components/ui';
import { useStore } from '@/lib/store';
import { BY_ID, DAYS } from '@/lib/catalog';
import { fmtMinutes, pickMeal, todayIdx } from '@/lib/model';
import { colors } from '@/lib/theme';

const SLOTS = { l: 'الغدا', d: 'العشا' } as const;

export default function Week() {
  const { state, update, replan } = useStore();
  const ti = todayIdx();

  const swap = (day: number, slot: 'l' | 'd') =>
    update((s) => {
      const used = new Set(s.week.flatMap((d) => [d.l, d.d]));
      return { ...s, week: s.week.map((d, i) => (i === day ? { ...d, [slot]: pickMeal(s, slot, used).id } : d)) };
    });

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text weight="bold" style={{ fontSize: 22 }}>خطة الأسبوع</Text>
        <Button title="خطة جديدة" small onPress={replan} />
      </View>
      <Text style={{ color: colors.muted, fontSize: 13 }}>الخطة بتتجنب أي أكلة حد في البيت مش بياكلها، وتذكيرات التحضير بتتظبط عليها.</Text>
      {state.week.map((d, i) => (
        <Card key={i} style={i === ti ? { borderColor: colors.orange, borderWidth: 2 } : undefined}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text weight="bold">{DAYS[i]}</Text>
            {i === ti && <Text weight="bold" style={{ color: colors.orangeInk, fontSize: 12 }}>النهاردة</Text>}
          </View>
          {(['l', 'd'] as const).map((slot) => {
            const meal = BY_ID[d[slot]];
            return (
              <View key={slot} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 }}>
                <Text weight="medium" style={{ color: colors.muted, fontSize: 12, width: 40 }}>{SLOTS[slot]}</Text>
                <View style={{ flex: 1 }}>
                  <Text weight="medium">{meal?.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{meal ? fmtMinutes(meal.minutes) : ''}</Text>
                </View>
                <Button title="غيّر" kind="quiet" small onPress={() => swap(i, slot)} />
              </View>
            );
          })}
        </Card>
      ))}
    </Screen>
  );
}
