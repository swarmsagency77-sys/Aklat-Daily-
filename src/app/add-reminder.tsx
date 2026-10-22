import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Chip, Chips, Field, Screen, Text, styles as ui } from '@/components/ui';
import { TimeStepper } from '@/components/TimeStepper';
import { useStore } from '@/lib/store';
import { MEAL_NAMES, MealKey, Reminder, Timing, TIMING_NAMES, uid } from '@/lib/model';
import { colors } from '@/lib/theme';

type Kind = Reminder['kind'];
const KIND_NAMES: Record<Kind, string> = { med: 'دوا', vit: 'فيتامين', task: 'مهمة' };

export default function AddReminder() {
  const { state, update } = useStore();
  const params = useLocalSearchParams<{ kind?: Kind }>();
  const [kind, setKind] = useState<Kind>(params.kind ?? 'med');
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [timing, setTiming] = useState<Timing>(params.kind === 'med' ? 'after' : 'with');
  const [meal, setMeal] = useState<MealKey>('b');
  const [time, setTime] = useState('10:00');
  const [who, setWho] = useState(state.members[0]?.id);
  const [err, setErr] = useState('');
  const isTask = kind === 'task';

  const save = () => {
    if (!name.trim()) return setErr('اكتب الاسم الأول.');
    const r: Reminder = { id: uid(), kind, name: name.trim(), dose: dose.trim(), timing: isTask ? 'time' : timing, meal, time, who };
    update((s) => ({ ...s, reminders: [...s.reminders, r] }));
    router.back();
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={ui.display}>{isTask ? 'مهمة جديدة' : `${KIND_NAMES[kind]} جديد`}</Text>
        <Button title="إلغاء" kind="quiet" small onPress={() => router.back()} />
      </View>
      <Chips>{(Object.keys(KIND_NAMES) as Kind[]).map((k) => <Chip key={k} label={KIND_NAMES[k]} on={kind === k} onPress={() => setKind(k)} />)}</Chips>

      <Field label={isTask ? 'المهمة' : 'الاسم'} value={name} onChangeText={(v) => { setName(v); setErr(''); }} error={err}
        placeholder={isTask ? 'مثلًا: اتصل بالجزار' : kind === 'med' ? 'مثلًا: دوا السكر' : 'مثلًا: فيتامين ب12'} />
      <Field label={isTask ? 'ملاحظة (اختياري)' : 'الجرعة (اختياري)'} value={dose} onChangeText={setDose} placeholder={isTask ? '' : 'مثلًا: حباية، معلقة، 10 نقط'} />

      {!isTask && (
        <>
          <Text weight="bold" style={{ fontSize: 13, color: colors.muted }}>إمتى؟</Text>
          <Chips>{(Object.keys(TIMING_NAMES) as Timing[]).map((t) => <Chip key={t} label={TIMING_NAMES[t]} on={timing === t} onPress={() => setTiming(t)} />)}</Chips>
          {timing !== 'empty' && timing !== 'time' && (
            <>
              <Text weight="bold" style={{ fontSize: 13, color: colors.muted }}>مع أنهي وجبة؟</Text>
              <Chips>{(Object.keys(MEAL_NAMES) as MealKey[]).map((k) => <Chip key={k} label={MEAL_NAMES[k]} on={meal === k} onPress={() => setMeal(k)} />)}</Chips>
            </>
          )}
          {state.members.length > 1 && (
            <>
              <Text weight="bold" style={{ fontSize: 13, color: colors.muted }}>لمين؟</Text>
              <Chips>{state.members.map((p) => <Chip key={p.id} label={p.name} on={who === p.id} onPress={() => setWho(p.id)} />)}</Chips>
            </>
          )}
        </>
      )}
      {(isTask || timing === 'time') && (
        <>
          <Text weight="bold" style={{ fontSize: 13, color: colors.muted }}>الساعة</Text>
          <TimeStepper value={time} onChange={setTime} />
        </>
      )}

      <Text style={{ color: colors.muted, fontSize: 13 }}>التذكير بيتكرر كل يوم، وهيوصلك إشعار حتى لو التطبيق مقفول.</Text>
      <Button title="احفظ التذكير" onPress={save} />
    </Screen>
  );
}
