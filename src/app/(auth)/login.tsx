import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Screen, Text, styles as ui } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { validate } from '@/lib/validate';

export default function Login() {
  const { update } = useStore();
  const [f, setF] = useState({ contact: '', pass: '' });
  const [err, setErr] = useState<Record<string, string>>({});

  // Device-only sign-in until the Supabase backend is connected.
  const submit = () => {
    const e = validate(f, ['contact', 'pass']);
    setErr(e);
    if (Object.keys(e).length) return;
    update((s) => ({ ...s, account: { name: s.members[0]?.name ?? '', contact: f.contact.trim() } }));
  };

  return (
    <Screen>
      <Button title="→ رجوع" kind="quiet" small onPress={() => router.back()} style={{ alignSelf: 'flex-start' }} />
      <Text style={ui.display}>أهلًا بيك تاني</Text>
      <Text style={{ color: colors.muted }}>ادخل وشوف خطة أكل النهاردة ومهامك.</Text>
      <View style={{ gap: 12, marginTop: 4 }}>
        <Field label="الإيميل أو رقم الموبايل" value={f.contact} onChangeText={(contact) => setF({ ...f, contact })} error={err.contact} autoCapitalize="none" keyboardType="email-address" textContentType="username" />
        <Field label="كلمة السر" value={f.pass} onChangeText={(pass) => setF({ ...f, pass })} error={err.pass} secureTextEntry textContentType="password" />
        <Button title="نسيت كلمة السر؟" kind="quiet" small onPress={() => router.push('/forgot')} style={{ alignSelf: 'flex-start' }} />
        <Button title="دخول" onPress={submit} />
      </View>
      <Button title="لسه معندكش حساب؟ اعمل حساب" kind="outline" onPress={() => router.replace('/signup')} />
    </Screen>
  );
}
