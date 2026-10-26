import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Chip, Chips, Text } from '@/components/ui';
import { DISLIKE_GROUPS } from '@/lib/catalog';
import { colors, radius } from '@/lib/theme';

/** "مش باكل" picker: one row per category; tap a row to open its items. */
export function DislikePicker({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <View style={{ gap: 6 }}>
      {DISLIKE_GROUPS.map((g) => {
        const isOpen = open === g.title;
        const picked = g.items.filter((i) => value.includes(i)).length;
        const all = picked === g.items.length;
        return (
          <View key={g.title} style={{ borderWidth: 1, borderColor: isOpen ? colors.orange : colors.line, borderRadius: radius.md, backgroundColor: colors.card }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpen(isOpen ? null : g.title)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}
            >
              <Text style={{ fontSize: 18 }}>{g.emoji}</Text>
              <Text weight="bold" style={{ flex: 1 }}>{g.title}</Text>
              {picked > 0 && <Text weight="medium" style={{ color: colors.orangeInk, fontSize: 12 }}>{all ? 'مش باكل خالص' : `${picked} مش باكلهم`}</Text>}
              <Text style={{ color: colors.muted }}>{isOpen ? '▲' : '▼'}</Text>
            </Pressable>
            {isOpen && (
              <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                <Chips>
                  <Chip
                    label="الكل"
                    negative
                    on={all}
                    onPress={() => onChange(all ? value.filter((x) => !g.items.includes(x)) : [...value.filter((x) => !g.items.includes(x)), ...g.items])}
                  />
                  {g.items.map((c) => <Chip key={c} label={c} negative on={value.includes(c)} onPress={() => toggle(c)} />)}
                </Chips>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
