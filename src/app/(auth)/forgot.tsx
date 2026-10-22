import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Card, Field, Screen, Text, styles as ui } from '@/components/ui';
import { colors } from '@/lib/theme';
import { validate } from '@/lib/validate';

export default function Forgot() {
  const [contact, setContact] = useState('');
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    const e = validate({ contact }, ['contact']);
    setErr(e.contact ?? '');
    if (!e.contact) setSent(true);
  };

  return (
    <Screen>
      <Button title="→ رجوع" kind="quiet" small onPress={() => router.back()} style={{ alignSelf: 'flex-start' }} />
      <Text style={ui.display}>نسيت كلمة السر؟</Text>
      <Text style={{ color: colors.muted }}>اكتب الإيميل أو الموبايل اللي عملت بيه الحساب.</Text>
      {sent ? (
        <>
          <Card style={{ backgroundColor: colors.greenSoft }}>
            <Text>تغيير كلمة السر هيشتغل لما نوصّل السيرفر (Supabase). لحد دلوقتي الحساب محفوظ على الموبايل بس.</Text>
          </Card>
          <Button title="رجوع لتسجيل الدخول" onPress={() => router.back()} />
        </>
      ) : (
        <>
          <Field label="الإيميل أو رقم الموبايل" value={contact} onChangeText={setContact} error={err} autoCapitalize="none" keyboardType="email-address" />
          <Button title="ابعتلي اللينك" onPress={submit} />
        </>
      )}
    </Screen>
  );
}
