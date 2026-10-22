import { useCallback, useState } from 'react';
import { Linking, Pressable, Switch, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Card, Chip, Chips, Screen, SectionTitle, Text } from '@/components/ui';
import { TimeStepper } from '@/components/TimeStepper';
import { useStore } from '@/lib/store';
import { DayTask, fmtTime, MEAL_NAMES, MealKey, NotifSettings, todayTasks } from '@/lib/model';
import { askPermission, permissionStatus, sendTestNotification, syncNotifications } from '@/lib/notifications';
import { colors, radius } from '@/lib/theme';

const KIND: Record<DayTask['kind'], [string, string, string]> = {
  med: ['دوا', colors.medSoft, colors.med],
  vit: ['فيتامين', colors.vitSoft, colors.vit],
  task: ['مهمة', colors.taskSoft, colors.task],
  prep: ['تحضير', colors.orangeSoft, colors.orangeInk],
  meal: ['وجبة', colors.line, colors.ink],
};
const PERIODS: [string, number, number][] = [['الصبح', 0, 720], ['الضهر والعصر', 720, 1020], ['بالليل', 1020, 1440]];

export default function Tasks() {
  const { state, update, markDone, addWater } = useStore();
  const [perm, setPerm] = useState<{ granted: boolean; canAskAgain: boolean } | null>(null);
  const [testSent, setTestSent] = useState(false);

  useFocusEffect(useCallback(() => { permissionStatus().then(setPerm).catch(() => {}); }, []));

  const tasks = todayTasks(state);
  const real = tasks.filter((t) => t.kind !== 'meal');
  const doneN = real.filter((t) => state.daily.done[t.id]).length;
  const { water } = state.daily;
  const goal = state.waterGoal;

  const enable = async () => {
    if (perm && !perm.canAskAgain) return Linking.openSettings();
    const ok = await askPermission();
    setPerm(await permissionStatus());
    if (ok) syncNotifications(state);
  };
  const setNotif = (patch: Partial<NotifSettings>) => update((s) => ({ ...s, notif: { ...s.notif, ...patch } }));
  const removeReminder = (id: string) => update((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) }));

  return (
    <Screen>
      <Text weight="bold" style={{ fontSize: 22 }}>مهام النهاردة</Text>
      <Text style={{ color: colors.muted, marginTop: -8 }}>دوا وفيتامينات ومياه وتحضير الأكل في مكان واحد</Text>

      {perm && !perm.granted && (
        <Card style={{ backgroundColor: colors.orangeSoft, borderColor: colors.orange }}>
          <Text weight="bold">التنبيهات مقفولة</Text>
          <Text style={{ fontSize: 13 }}>من غيرها مش هنقدر نفكّرك بميعاد الدوا والمياه.</Text>
          <Button title={perm.canAskAgain ? 'فعّل التنبيهات' : 'افتح الإعدادات وفعّلها'} onPress={enable} />
        </Card>
      )}

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 6, borderColor: real.length && doneN === real.length ? colors.green : colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text weight="bold">{real.length ? Math.round((doneN / real.length) * 100) : 0}%</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text weight="bold" style={{ fontSize: 16 }}>خلصت {doneN} من {real.length}</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{real.length && doneN === real.length ? 'عاش! يومك خلص كله.' : 'علّم على اللي خلصته، وإحنا نفكّرك بالباقي.'}</Text>
        </View>
      </Card>

      <SectionTitle>المياه</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text weight="bold">{water >= goal ? 'شربت كفايتك النهاردة' : `فاضل ${goal - water} كوبايات`}</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{water} من {goal} · {(water * 0.25).toFixed(1)} لتر</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {Array.from({ length: goal }, (_, i) => (
            <Pressable key={i} accessibilityLabel={`كوباية ${i + 1}`} onPress={() => addWater((i + 1 === water ? i : i + 1) - water)}
              style={{ width: 32, height: 40, borderWidth: 2, borderTopWidth: 0, borderColor: colors.green, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, overflow: 'hidden', justifyContent: 'flex-end' }}>
              {i < water && <View style={{ height: '78%', backgroundColor: '#3B9EDB' }} />}
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Button title="+ دوا" kind="green" small onPress={() => router.push({ pathname: '/add-reminder', params: { kind: 'med' } })} />
        <Button title="+ فيتامين" kind="quiet" small onPress={() => router.push({ pathname: '/add-reminder', params: { kind: 'vit' } })} />
        <Button title="+ مهمة" kind="quiet" small onPress={() => router.push({ pathname: '/add-reminder', params: { kind: 'task' } })} />
      </View>

      {!state.reminders.length && (
        <Card style={{ backgroundColor: colors.greenSoft }}>
          <Text>لسه مضفتش دوا أو فيتامين. دوس "+ دوا" واختار ميعاده: على الريق، قبل الأكل، مع الأكل، أو بعده.</Text>
        </Card>
      )}

      {PERIODS.map(([title, a, b]) => {
        const list = tasks.filter((t) => t.at >= a && t.at < b);
        if (!list.length) return null;
        return (
          <View key={title} style={{ gap: 8 }}>
            <SectionTitle>{title}</SectionTitle>
            {list.map((t) => {
              const [label, bg, fg] = KIND[t.kind];
              const done = !!state.daily.done[t.id];
              return (
                <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 12, opacity: done ? 0.55 : 1 }}>
                  <Text weight="bold" style={{ width: 62, fontSize: 13 }}>{fmtTime(t.at)}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ alignSelf: 'flex-start', backgroundColor: bg, borderRadius: 6, paddingHorizontal: 7 }}>
                      <Text weight="bold" style={{ color: fg, fontSize: 11 }}>{label}</Text>
                    </View>
                    <Text weight="bold" style={done ? { textDecorationLine: 'line-through' } : undefined}>{t.title}</Text>
                    {!!t.sub && <Text style={{ color: colors.muted, fontSize: 12 }}>{t.sub}</Text>}
                  </View>
                  {t.reminderId && (
                    <Pressable accessibilityLabel={`امسح ${t.title}`} onPress={() => removeReminder(t.reminderId!)} hitSlop={8}>
                      <Text style={{ color: colors.muted, fontSize: 20 }}>×</Text>
                    </Pressable>
                  )}
                  {t.kind !== 'meal' && (
                    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: done }} onPress={() => markDone(t.id, !done)}
                      style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.green, backgroundColor: done ? colors.green : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      {done && <Text weight="bold" style={{ color: colors.white }}>✓</Text>}
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      <SectionTitle>التنبيهات</SectionTitle>
      <Card>
        <Row label="التنبيهات شغالة" sub="إشعار في ميعاد كل دوا وفيتامين ومهمة وتحضير">
          <Switch value={state.notif.on} onValueChange={(on) => setNotif({ on })} trackColor={{ true: colors.green }} />
        </Row>
        <Row label="فكّرني بالمياه" sub="كل ساعتين من 11 الصبح لـ 9 بالليل">
          <Switch value={state.notif.water} onValueChange={(w) => setNotif({ water: w })} trackColor={{ true: colors.green }} />
        </Row>
        <Text weight="medium">نبّهني</Text>
        <Chips>
          {([[0, 'في الميعاد'], [5, 'قبلها بـ 5 دقايق'], [15, 'قبلها بربع ساعة']] as const).map(([v, l]) => (
            <Chip key={v} label={l} on={state.notif.lead === v} onPress={() => setNotif({ lead: v })} />
          ))}
        </Chips>
        <Button title={testSent ? 'اقفل التطبيق واستنى 5 ثواني' : 'جرّب إشعار (بعد 5 ثواني)'} onPress={async () => { await sendTestNotification(); setTestSent(true); setTimeout(() => setTestSent(false), 8000); }} />
      </Card>

      <SectionTitle>مواعيد الأكل</SectionTitle>
      <Card>
        {(Object.keys(MEAL_NAMES) as MealKey[]).map((k) => (
          <Row key={k} label={MEAL_NAMES[k]}>
            <TimeStepper value={state.mealTimes[k]} onChange={(v) => update((s) => ({ ...s, mealTimes: { ...s.mealTimes, [k]: v } }))} />
          </Row>
        ))}
        <Text style={{ color: colors.muted, fontSize: 12 }}>مواعيد الدوا اللي قبل وبعد الأكل بتتظبط لوحدها على المواعيد دي.</Text>
      </Card>

      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 20 }}>
        أكلات بيفكّرك بالمواعيد بس، مش بديل عن الدكتور. خد الدوا زي ما الدكتور أو الصيدلي قالك.
      </Text>
    </Screen>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 4 }}>
      <View style={{ flex: 1 }}>
        <Text weight="medium">{label}</Text>
        {!!sub && <Text style={{ color: colors.muted, fontSize: 12 }}>{sub}</Text>}
      </View>
      {children}
    </View>
  );
}
