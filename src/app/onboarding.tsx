import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Button, Card, Chip, Chips, Field, Screen, Text, styles as ui } from '@/components/ui';
import { useStore } from '@/lib/store';
import { CATS, DISLIKES } from '@/lib/catalog';
import { buildWeek, uid } from '@/lib/model';
import { askPermission } from '@/lib/notifications';
import { colors, radius } from '@/lib/theme';

type Who = 'solo' | 'couple' | 'family';
const FREE_EXTRA = 2;
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function Onboarding() {
  const { state, update } = useStore();
  const [step, setStep] = useState(1);
  const [who, setWho] = useState<Who | null>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [others, setOthers] = useState<string[]>(['']);
  const [busy, setBusy] = useState(false);

  const solo = who === 'solo';
  const steps = solo ? ['who', 'taste', 'notif'] : ['who', 'taste', 'others', 'notif'];
  const current = steps[step - 1];
  const name = state.account?.name || 'صاحبي';

  const finish = async (allowNotifications: boolean) => {
    setBusy(true);
    if (allowNotifications) await askPermission().catch(() => false);
    update((s) => {
      const members = [
        { id: uid(), name: s.account?.name || 'أنا', likes, dislikes },
        ...(solo ? [] : others.map((n) => n.trim()).filter(Boolean).map((n) => ({ id: uid(), name: n, likes: [], dislikes: [] }))),
      ];
      const next = { ...s, members };
      return { ...next, week: buildWeek(next), onboarded: true };
    });
  };

  if (busy) {
    return (
      <Screen scroll={false} style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <ActivityIndicator size="large" color={colors.orange} />
        <Text style={ui.display}>بنجهّزلك أول خطة...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {step > 1 ? <Button title="→ رجوع" kind="quiet" small onPress={() => setStep(step - 1)} /> : <View />}
        <Text style={{ color: colors.muted, fontSize: 12 }}>خطوة {step} من {steps.length}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 99, backgroundColor: colors.line, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${(step / steps.length) * 100}%`, backgroundColor: colors.orange, borderRadius: 99 }} />
      </View>

      {current === 'who' && (
        <>
          <Text style={ui.display}>أهلًا يا {name}! مين هياكل معاك؟</Text>
          <Text style={{ color: colors.muted }}>عشان نظبط الكميات والاقتراحات.</Text>
          {([['solo', 'أنا بس', 'عايش لوحدي ومحتار آكل إيه'], ['couple', 'أنا وشريكي', 'اتنين، وكل واحد ليه ذوقه'], ['family', 'العيلة', 'بيت فيه كذا فرد']] as const).map(([v, t, sub]) => (
            <Pressable
              key={v}
              accessibilityRole="button"
              accessibilityState={{ selected: who === v }}
              onPress={() => setWho(v)}
              style={{ borderWidth: 2, borderColor: who === v ? colors.orange : colors.line, backgroundColor: who === v ? colors.orangeSoft : colors.card, borderRadius: radius.lg, padding: 14 }}
            >
              <Text weight="bold" style={{ fontSize: 17 }}>{t}</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{sub}</Text>
            </Pressable>
          ))}
          <Button title="التالي" disabled={!who} onPress={() => setStep(2)} />
        </>
      )}

      {current === 'taste' && (
        <>
          <Text style={ui.display}>بتحب تاكل إيه؟</Text>
          <Text style={{ color: colors.muted }}>اختار براحتك، تقدر تغيّر ده أي وقت.</Text>
          <Text weight="bold" style={{ fontSize: 13, color: colors.muted }}>بحب</Text>
          <Chips>{CATS.map((c) => <Chip key={c} label={c} on={likes.includes(c)} onPress={() => setLikes(toggle(likes, c))} />)}</Chips>
          <Text weight="bold" style={{ fontSize: 13, color: colors.muted }}>مش باكل</Text>
          <Chips>{DISLIKES.map((c) => <Chip key={c} label={c} negative on={dislikes.includes(c)} onPress={() => setDislikes(toggle(dislikes, c))} />)}</Chips>
          <Button title="التالي" onPress={() => setStep(3)} />
        </>
      )}

      {current === 'others' && (
        <>
          <Text style={ui.display}>مين معاك في البيت؟</Text>
          <Text style={{ color: colors.muted }}>ضيف أساميهم دلوقتي، وكل واحد يظبط ذوقه بعدين من صفحة البيت.</Text>
          {others.map((n, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <Field label={`الفرد ${i + 1}`} value={n} onChangeText={(v) => setOthers(others.map((x, j) => (j === i ? v : x)))} placeholder="الاسم" />
              </View>
              <Button title="شيل" kind="quiet" small onPress={() => setOthers(others.filter((_, j) => j !== i))} />
            </View>
          ))}
          {others.length < FREE_EXTRA ? (
            <Button title="+ ضيف فرد" kind="outline" onPress={() => setOthers([...others, ''])} />
          ) : (
            <Card style={{ backgroundColor: colors.greenSoft }}>
              <Text>المجاني فيه حسابك وفردين. مع Aklat+ تقدر تضيف كل البيت.</Text>
            </Card>
          )}
          <Button title="التالي" onPress={() => setStep(step + 1)} />
        </>
      )}

      {current === 'notif' && (
        <>
          <Text style={ui.display}>نفكّرك في الوقت الصح؟</Text>
          <Text style={{ color: colors.muted }}>
            أكلات بيبعتلك إشعار بميعاد الدوا والفيتامينات، وتشرب مياه، وتبدأ تحضير الأكل، وتطلّع اللحمة من الفريزر. الإشعارات بتوصل حتى لو التطبيق مقفول.
          </Text>
          <Card>
            <Text weight="bold">ميعاد الدوا 💊</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>دوا الضغط · حباية · على الريق، قبل الفطار بنص ساعة</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <View style={{ backgroundColor: colors.greenSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontSize: 12 }}>خلصت ✓</Text></View>
              <View style={{ backgroundColor: colors.greenSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontSize: 12 }}>فكّرني بعد 10 دقايق</Text></View>
            </View>
          </Card>
          <Button title="فعّل التنبيهات" onPress={() => finish(true)} />
          <Button title="بعدين" kind="quiet" onPress={() => finish(false)} />
        </>
      )}
    </Screen>
  );
}
