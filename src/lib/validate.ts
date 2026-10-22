export const validContact = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || /^\+?[0-9٠-٩ ]{10,15}$/.test(v.trim());

export function validate(f: { name?: string; contact?: string; pass?: string }, keys: ('name' | 'contact' | 'pass')[]) {
  const e: Record<string, string> = {};
  if (keys.includes('name') && !(f.name ?? '').trim()) e.name = 'اكتب اسمك عشان نناديك بيه.';
  if (keys.includes('contact') && !validContact(f.contact ?? '')) e.contact = 'اكتب إيميل صحيح أو رقم موبايل من 11 رقم.';
  if (keys.includes('pass') && (f.pass ?? '').length < 8) e.pass = 'كلمة السر لازم تبقى 8 حروف أو أرقام على الأقل.';
  return e;
}
