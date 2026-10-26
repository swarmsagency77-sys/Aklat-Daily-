import { BY_ID, CATALOG, FROZEN, Meal, Slot } from './catalog';

export type Member = { id: string; name: string; likes: string[]; dislikes: string[] };
export type Timing = 'empty' | 'before' | 'with' | 'after' | 'time';
export type MealKey = 'b' | 'l' | 'd';
export type Reminder = {
  id: string;
  kind: 'med' | 'vit' | 'task';
  name: string;
  dose?: string;
  timing: Timing;
  meal: MealKey;
  time: string; // "HH:MM", used when timing === 'time' or kind === 'task'
  who?: string;
};
export type DayPlan = { l: string; d: string };
export type NotifSettings = { on: boolean; water: boolean; lead: 0 | 5 | 15 };
export type Daily = { date: string; done: Record<string, boolean>; water: number };

export type State = {
  account: { name: string; contact: string } | null;
  onboarded: boolean;
  members: Member[];
  week: DayPlan[];
  favs: string[];
  reminders: Reminder[];
  mealTimes: Record<MealKey, string>;
  waterGoal: number;
  notif: NotifSettings;
  daily: Daily;
};

export const uid = () => Math.random().toString(36).slice(2, 10);
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const toMin = (s: string) => {
  const [h, mm] = s.split(':').map(Number);
  return (h || 0) * 60 + (mm || 0);
};
export const fmtTime = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'ص' : 'م'}`;
};
export const fmtMinutes = (t: number) =>
  t >= 60 ? `${Math.floor(t / 60)} س${t % 60 ? ` و${t % 60} د` : ''}` : `${t} دقيقة`;
/** Saturday-first index used by the week plan. */
export const todayIdx = (d = new Date()) => (d.getDay() + 1) % 7;

export const MEAL_NAMES: Record<MealKey, string> = { b: 'الفطار', l: 'الغدا', d: 'العشا' };
export const TIMING_NAMES: Record<Timing, string> = {
  empty: 'على الريق', before: 'قبل الأكل', with: 'مع الأكل', after: 'بعد الأكل', time: 'في وقت محدد',
};

export function initialState(): State {
  return {
    account: null,
    onboarded: false,
    members: [],
    week: [],
    favs: [],
    reminders: [],
    mealTimes: { b: '09:00', l: '15:00', d: '21:00' },
    waterGoal: 8,
    notif: { on: true, water: true, lead: 0 },
    daily: { date: dateKey(), done: {}, water: 0 },
  };
}

/* ---------- Meal planning ---------- */
// Whole-word match, also trying each word without a leading "و" ("وكزبرة" → "كزبرة").
const mentions = (text: string, item: string) =>
  [text, text.replace(/(^|\s)و(?=\S{3})/g, '$1')].some((t) => ` ${t} `.includes(` ${item} `));
export const allowed = (s: State, meal: Meal) => {
  const texts = [meal.name, ...meal.has, ...meal.ing.map(([item]) => item)];
  return !s.members.some((p) => p.dislikes.some((d) => texts.some((t) => mentions(t, d))));
};
const score = (s: State, meal: Meal) =>
  s.members.reduce((n, p) => n + meal.cats.filter((c) => p.likes.includes(c)).length, 0) +
  (s.favs.includes(meal.id) ? 1.5 : 0);

export function pickMeal(s: State, slot: Slot, used: Set<string>): Meal {
  const fits = CATALOG.filter((x) => x.slots.includes(slot) && allowed(s, x));
  const pool = fits.filter((x) => !used.has(x.id));
  const list = pool.length ? pool : fits.length ? fits : CATALOG.filter((x) => x.slots.includes(slot));
  const weights = list.map((x) => 1 + score(s, x) * 1.4 + Math.random() * 2);
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) {
    r -= weights[i];
    if (r <= 0) return list[i];
  }
  return list[0];
}

export function buildWeek(s: State): DayPlan[] {
  const used = new Set<string>();
  return Array.from({ length: 7 }, () => {
    const l = pickMeal(s, 'l', used);
    used.add(l.id);
    const d = pickMeal(s, 'd', used);
    used.add(d.id);
    return { l: l.id, d: d.id };
  });
}

export function whyMeal(s: State, meal: Meal) {
  const fans = s.members.filter((p) => meal.cats.some((c) => p.likes.includes(c))).map((p) => p.name);
  if (fans.length && fans.length === s.members.length) return 'كل اللي في البيت بيحبوا النوع ده.';
  if (fans.length) return `على مزاج ${fans.join(' و')}، ومفيهاش حاجة حد مش بياكلها.`;
  return 'حاجة جديدة للأسبوع، ومفيهاش حاجة حد مش بياكلها.';
}

/* ---------- Daily tasks ---------- */
export type TaskKind = 'med' | 'vit' | 'task' | 'prep' | 'meal';
export type DayTask = { id: string; kind: TaskKind; at: number; title: string; sub: string; reminderId?: string };

export function reminderMinute(s: State, r: Reminder) {
  if (r.kind === 'task' || r.timing === 'time') return toMin(r.time);
  const base = toMin(s.mealTimes[r.meal]);
  return base + ({ empty: -30, before: -30, with: 0, after: 30 } as const)[r.timing];
}

export function reminderSub(s: State, r: Reminder) {
  if (r.kind === 'task') return r.dose || '';
  const when =
    r.timing === 'empty' ? 'على الريق، قبل الفطار بنص ساعة'
    : r.timing === 'before' ? `قبل ${MEAL_NAMES[r.meal]} بنص ساعة`
    : r.timing === 'with' ? `مع ${MEAL_NAMES[r.meal]}`
    : r.timing === 'after' ? `بعد ${MEAL_NAMES[r.meal]}`
    : 'في ميعاده';
  const who = s.members.length > 1 ? s.members.find((p) => p.id === r.who)?.name : '';
  return [r.dose, when, who && `لـ${who}`].filter(Boolean).join(' · ');
}

/** Prep and freezer tasks generated from the meal plan for a given day index. */
export function prepTasksFor(s: State, dayIdx: number): DayTask[] {
  if (!s.week.length) return [];
  const out: DayTask[] = [];
  const L = BY_ID[s.week[dayIdx].l];
  const D = BY_ID[s.week[dayIdx].d];
  const next = BY_ID[s.week[(dayIdx + 1) % 7].l];
  if (L) out.push({ id: `prep-l-${dayIdx}`, kind: 'prep', at: toMin(s.mealTimes.l) - L.minutes, title: `ابدأ تحضير ${L.name}`, sub: `محتاجة ${fmtMinutes(L.minutes)} عشان تجهز على الغدا` });
  if (D) out.push({ id: `prep-d-${dayIdx}`, kind: 'prep', at: toMin(s.mealTimes.d) - D.minutes, title: `ابدأ تحضير ${D.name}`, sub: `محتاجة ${fmtMinutes(D.minutes)}` });
  const frozen = next ? next.has.filter((h) => FROZEN.includes(h)) : [];
  if (frozen.length) out.push({ id: `thaw-${dayIdx}`, kind: 'prep', at: 22 * 60, title: `طلّع ال${frozen.join(' وال')} من الفريزر`, sub: `عشان ${next.name} بكرة` });
  return out;
}

export function todayTasks(s: State): DayTask[] {
  const ti = todayIdx();
  const out: DayTask[] = s.reminders.map((r) => ({
    id: `r-${r.id}`, reminderId: r.id, kind: r.kind, at: reminderMinute(s, r), title: r.name, sub: reminderSub(s, r),
  }));
  if (s.week.length) {
    out.push({ id: 'meal-b', kind: 'meal', at: toMin(s.mealTimes.b), title: 'الفطار', sub: '' });
    out.push({ id: 'meal-l', kind: 'meal', at: toMin(s.mealTimes.l), title: `الغدا: ${BY_ID[s.week[ti].l]?.name ?? ''}`, sub: '' });
    out.push({ id: 'meal-d', kind: 'meal', at: toMin(s.mealTimes.d), title: `العشا: ${BY_ID[s.week[ti].d]?.name ?? ''}`, sub: '' });
    out.push(...prepTasksFor(s, ti));
  }
  return out.sort((a, b) => a.at - b.at);
}
