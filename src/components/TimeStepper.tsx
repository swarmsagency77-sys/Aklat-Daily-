import { View } from 'react-native';
import { Button, Text } from './ui';
import { fmtTime, toMin } from '@/lib/model';

const toHHMM = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Small +/- control for a "HH:MM" value; avoids a native picker dependency. */
export function TimeStepper({ value, onChange, step = 15 }: { value: string; onChange: (v: string) => void; step?: number }) {
  const min = toMin(value);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Button title="−" kind="quiet" small onPress={() => onChange(toHHMM(min - step))} />
      <Text weight="bold" style={{ minWidth: 72, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{fmtTime(min)}</Text>
      <Button title="+" kind="quiet" small onPress={() => onChange(toHHMM(min + step))} />
    </View>
  );
}
