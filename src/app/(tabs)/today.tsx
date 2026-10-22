import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Screen, SectionTitle, Text, styles as ui } from '@/components/ui';
import { useStore } from '@/lib/store';
import { BY_ID, DAYS } from '@/lib/catalog';
import { fmtMinutes, fmtTime, pickMeal, todayIdx, todayTasks, whyMeal } from '@/lib/model';
import { colors, fonts, radius } from '@/lib/theme';

export default function Today() {
  const { state, update } = useStore();
  const ti = todayIdx();
  const plan = state.week[ti];
  if (!plan) return null;
  const L = BY_ID[plan.l];
  const D = BY_ID[plan.d];
  const h = new Date().getHours();
  const hello = h < 12 ? 'صباح الفل' : h < 18 ? 'نهارك سعيد' : 'مساء الخير';

  const swap = (slot: 'l' | 'd') =>
    update((s) => {
      const used = new Set(s.week.flatMap((d) => [d.l, d.d]));
      const week = s.week.map((d, i) => (i === ti ? { ...d, [slot]: pickMeal(s, slot, used).id } : d));
      return { ...s, week };
    });
  const fav = (id: string) =>
    update((s) => ({ ...s, favs: s.favs.includes(id) ? s.favs.filter((x) => x !== id) : [...s.favs, id] }));

  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const next = todayTasks(state).find((t) => t.kind !== 'meal' && !state.daily.done[t.id] && t.at >= now - 15);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, color: colors.orange }}>أكلات</Text>
        <Text weight="bold" style={{ color: colors.green }}>daily</Text>
      </View>
      <Text weight="bold" style={{ fontSize: 22 }}>{hello} يا {state.members[0]?.name}</Text>
      <Text style={{ color: colors.muted, marginTop: -8 }}>{DAYS[ti]} · أكل لـ{state.members.length} {state.members.length > 2 ? 'أفراد' : 'فرد'}</Text>

      <View style={{ backgroundColor: colors.orange, borderRadius: radius.xl, padding: 18, gap: 6 }}>
        <Text weight="medium" style={{ color: colors.white, fontSize: 13 }}>غدا النهاردة</Text>
        <Text style={[ui.display, { color: colors.white, fontSize: 38, lineHeight: 50 }]}>{L.name}</Text>
        <Text style={{ color: colors.white }}>{whyMeal(state, L)}</Text>
        <Text style={{ color: colors.white, fontSize: 13 }}>{L.cats.join(' · ')} · {fmtMinutes(L.minutes)}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <Button title="غيّرها" kind="light" small onPress={() => swap('l')} />
          <Button title={state.favs.includes(L.id) ? 'في المفضلة ♥' : 'حبيتها'} kind="light" small onPress={() => fav(L.id)} />
        </View>
      </View>

      <SectionTitle>العشا</SectionTitle>
      <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text weight="bold" style={{ fontSize: 16 }}>{D.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{fmtMinutes(D.minutes)} · {D.cats.join('، ')}</Text>
        </View>
        <Button title="غيّر" kind="quiet" small onPress={() => swap('d')} />
      </Card>

      {next && (
        <>
          <SectionTitle>المهمة الجاية</SectionTitle>
          <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text weight="bold" style={{ color: colors.orangeInk, fontSize: 13 }}>{fmtTime(next.at)}</Text>
              <Text weight="bold">{next.title}</Text>
              {!!next.sub && <Text style={{ color: colors.muted, fontSize: 13 }}>{next.sub}</Text>}
            </View>
            <Button title="كل المهام" kind="quiet" small onPress={() => router.navigate('/tasks')} />
          </Card>
        </>
      )}
    </Screen>
  );
}
