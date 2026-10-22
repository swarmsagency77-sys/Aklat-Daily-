import { TextInput, View } from 'react-native';
import { Button, Card, Chip, Chips, Screen, Text } from '@/components/ui';
import { useStore } from '@/lib/store';
import { CATS, DISLIKES } from '@/lib/catalog';
import { Member, uid } from '@/lib/model';
import { colors, fonts } from '@/lib/theme';

const FREE_MEMBERS = 3;
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function Home() {
  const { state, update, replan, signOut } = useStore();
  const setMember = (id: string, patch: Partial<Member>) =>
    update((s) => ({ ...s, members: s.members.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const full = state.members.length >= FREE_MEMBERS;

  return (
    <Screen>
      <Text weight="bold" style={{ fontSize: 22 }}>أهل البيت</Text>
      <Text style={{ color: colors.muted, marginTop: -8 }}>كل فرد يختار بيحب إيه ومش بياكل إيه، والاقتراحات بتتظبط على الكل.</Text>

      {state.members.map((p, i) => (
        <Card key={p.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: i % 2 ? colors.orange : colors.green, alignItems: 'center', justifyContent: 'center' }}>
              <Text weight="bold" style={{ color: colors.white, fontSize: 18 }}>{p.name.trim().charAt(0) || '؟'}</Text>
            </View>
            <TextInput
              value={p.name}
              onChangeText={(name) => setMember(p.id, { name })}
              accessibilityLabel="الاسم"
              style={{ flex: 1, fontFamily: fonts.bold, fontSize: 17, color: colors.ink, writingDirection: 'rtl' }}
            />
            {i > 0 && <Button title="شيل" kind="quiet" small onPress={() => update((s) => ({ ...s, members: s.members.filter((x) => x.id !== p.id) }))} />}
          </View>
          <Text weight="bold" style={{ fontSize: 12, color: colors.muted }}>بيحب</Text>
          <Chips>{CATS.map((c) => <Chip key={c} label={c} on={p.likes.includes(c)} onPress={() => setMember(p.id, { likes: toggle(p.likes, c) })} />)}</Chips>
          <Text weight="bold" style={{ fontSize: 12, color: colors.muted }}>مش بياكل</Text>
          <Chips>{DISLIKES.map((c) => <Chip key={c} label={c} negative on={p.dislikes.includes(c)} onPress={() => setMember(p.id, { dislikes: toggle(p.dislikes, c) })} />)}</Chips>
        </Card>
      ))}

      {full ? (
        <Card style={{ backgroundColor: colors.greenSoft }}>
          <Text>المجاني فيه حسابك وفردين. Aklat+ هيبقى فيه أفراد بلا حدود.</Text>
        </Card>
      ) : (
        <Button title="+ ضيف فرد" kind="green" onPress={() => update((s) => ({ ...s, members: [...s.members, { id: uid(), name: 'فرد جديد', likes: [], dislikes: [] }] }))} />
      )}
      <Button title="اعمل خطة الأسبوع من جديد على التفضيلات دي" kind="quiet" onPress={replan} />

      <Card style={{ marginTop: 12 }}>
        <Text weight="bold">حسابك</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>{state.account?.contact}</Text>
        <Button title="تسجيل خروج" kind="outline" onPress={signOut} />
      </Card>
    </Screen>
  );
}
