import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { buildWeek, dateKey, initialState, State } from './model';
import { setupNotifications, syncNotifications } from './notifications';

const KEY = 'aklat-daily/state/v1';

type Store = {
  ready: boolean;
  state: State;
  update: (fn: (s: State) => State) => void;
  markDone: (taskId: string, done?: boolean) => void;
  addWater: (delta?: number) => void;
  replan: () => void;
  signOut: () => void;
};

const Ctx = createContext<Store | null>(null);

/** Start a fresh day's checklist when the date changes. */
const rollDay = (s: State): State =>
  s.daily.date === dateKey() ? s : { ...s, daily: { date: dateKey(), done: {}, water: 0 } };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  const update = useCallback((fn: (s: State) => State) => setState((s) => fn(rollDay(s))), []);

  const markDone = useCallback(
    (taskId: string, done = true) =>
      update((s) => ({ ...s, daily: { ...s.daily, done: { ...s.daily.done, [taskId]: done } } })),
    [update],
  );
  const addWater = useCallback(
    (delta = 1) =>
      update((s) => ({ ...s, daily: { ...s.daily, water: Math.max(0, Math.min(s.waterGoal, s.daily.water + delta)) } })),
    [update],
  );

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setState(rollDay({ ...initialState(), ...JSON.parse(raw) }));
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    setupNotifications({
      getState: () => ref.current,
      markDone: (id) => markDone(id),
      addWater: () => addWater(1),
    }).catch(() => {});
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') setState((s) => rollDay(s));
    });
    return () => sub.remove();
  }, [markDone, addWater]);

  // Persist on every change; reschedule notifications when anything they depend on changes.
  const scheduleKey = JSON.stringify([state.account, state.reminders, state.mealTimes, state.notif, state.week, state.waterGoal, state.members]);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);
  useEffect(() => {
    if (ready) syncNotifications(ref.current);
  }, [scheduleKey, ready]);

  const value = useMemo<Store>(
    () => ({
      ready,
      state,
      update,
      markDone,
      addWater,
      replan: () => update((s) => ({ ...s, week: buildWeek(s) })),
      signOut: () => update((s) => ({ ...s, account: null })),
    }),
    [ready, state, update, markDone, addWater],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
