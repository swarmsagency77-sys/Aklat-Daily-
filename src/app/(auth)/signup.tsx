import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Screen, Text, styles as ui } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { validate } from '@/lib/validate';

export default function SignUp() {
  const { update } = useStore();
  const [f, setF] = useState({ name: '', contact: '', pass: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [peek, setPeek] = useState(false);

  // Accounts live on the device for now; Supabase Auth replaces this step.
  const submit = () => {
    const e = validate(f, ['name', 'contact', 'pass']);
    setErr(e);
    if (Object.keys(e).length) return;
    update((s) => ({ ...s, account: { name: f.name.trim(), contact: f.contact.trim() }, onboarded: false }));
  };

  return (
    <Screen>
      <Button title="→ رجوع" kind="quiet" small onPress={() => router.back()} style={{ alignSelf: 'flex-start' }} />
      <Text style={ui.display}>اعمل حسابك</Text>
      <Text style={{ color: colors.muted }}>مجاني: حسابك وفردين كمان من أهل البيت.</Text>
      <View style={{ gap: 12, marginTop: 4 }}>
        <Field label="اسمك" value={f.name} onChangeText={(name) => setF({ ...f, name })} error={err.name} placeholder="مثلًا: أحمد" autoComplete="name" textContentType="name" />
        <Field label="الإيميل أو رقم الموبايل" value={f.contact} onChangeText={(contact) => setF({ ...f, contact })} error={err.contact} placeholder="name@mail.com أو 01xxxxxxxxx" autoCapitalize="none" keyboardType="email-address" textContentType="username" />
        <Field label="كلمة السر" value={f.pass} onChangeText={(pass) => setF({ ...f, pass })} error={err.pass} placeholder="8 حروف أو أرقام على الأقل" secureTextEntry={!peek} textContentType="newPassword" />
        <Button title={peek ? 'اخفي كلمة السر' : 'اظهر كلمة السر'} kind="quiet" small onPress={() => setPeek(!peek)} style={{ alignSelf: 'flex-start' }} />
        <Button title="اعمل الحساب" onPress={submit} />
      </View>
      <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>لما تعمل حساب إنت موافق على الشروط وسياسة الخصوصية.</Text>
      <Button title="عندك حساب؟ سجّل دخول" kind="outline" onPress={() => router.replace('/login')} />
    </Screen>
  );
}
