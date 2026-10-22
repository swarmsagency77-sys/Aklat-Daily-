import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { dateKey, prepTasksFor, reminderMinute, reminderSub, State, todayIdx } from './model';

/*
 * All reminders are local notifications scheduled on the phone itself, so they
 * arrive even when the app is closed and the phone is offline.
 *
 * - Medicine, vitamins and personal tasks repeat daily (DAILY trigger), so they
 *   keep firing even if the app is not opened for days.
 * - Water reminders repeat daily every two hours.
 * - Cooking prep and freezer reminders come from the meal plan and are
 *   scheduled as one-off dates for the next 7 days.
 * Everything is cancelled and rebuilt from state on each change (sync).
 */

const CHANNEL = 'reminders';
const CAT_TASK = 'task';
const CAT_WATER = 'water';
const WATER_HOURS = [11, 13, 15, 17, 19, 21];
const SNOOZE_MIN = 10;

type Handlers = {
  getState: () => State | null;
  markDone: (taskId: string) => void;
  addWater: () => void;
};
let handlers: Handlers | null = null;

export async function setupNotifications(h: Handlers) {
  handlers = h;

  // While the app is open: skip a reminder the user already ticked off today.
  Notifications.setNotificationHandler({
    handleNotification: async (n) => {
      const data = n.request.content.data as { taskId?: string } | undefined;
      const s = handlers?.getState();
      const done = !!(data?.taskId && s && s.daily.date === dateKey() && s.daily.done[data.taskId]);
      return { shouldShowBanner: !done, shouldShowList: !done, shouldPlaySound: !done, shouldSetBadge: false };
    },
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'التذكيرات',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: '#FF6A00',
    });
  }

  await Notifications.setNotificationCategoryAsync(CAT_TASK, [
    { identifier: 'done', buttonTitle: 'خلصت ✓', options: { opensAppToForeground: true } },
    { identifier: 'snooze', buttonTitle: `فكّرني بعد ${SNOOZE_MIN} دقايق`, options: { opensAppToForeground: true } },
  ]);
  await Notifications.setNotificationCategoryAsync(CAT_WATER, [
    { identifier: 'drank', buttonTitle: 'شربت كوباية', options: { opensAppToForeground: true } },
    { identifier: 'snooze', buttonTitle: `فكّرني بعد ${SNOOZE_MIN} دقايق`, options: { opensAppToForeground: true } },
  ]);

  const onResponse = async (res: Notifications.NotificationResponse) => {
    const content = res.notification.request.content;
    const data = (content.data ?? {}) as { taskId?: string };
    if (res.actionIdentifier === 'done' && data.taskId) handlers?.markDone(data.taskId);
    else if (res.actionIdentifier === 'drank') handlers?.addWater();
    else if (res.actionIdentifier === 'snooze') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title ?? 'تذكير',
          body: content.body ? `${content.body} · تذكير تاني` : 'تذكير تاني',
          data: content.data,
          categoryIdentifier: content.categoryIdentifier ?? CAT_TASK,
          sound: 'default',
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: SNOOZE_MIN * 60, channelId: CHANNEL },
      });
    } else {
      router.navigate('/tasks');
    }
    await Notifications.clearLastNotificationResponseAsync();
  };

  Notifications.addNotificationResponseReceivedListener(onResponse);
  const last = await Notifications.getLastNotificationResponseAsync();
  if (last) onResponse(last);
}

export async function permissionStatus() {
  const p = await Notifications.getPermissionsAsync();
  return { granted: p.granted, canAskAgain: p.canAskAgain };
}

export async function askPermission() {
  const p = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return p.granted;
}

const KIND_TITLE = { med: 'ميعاد الدوا 💊', vit: 'ميعاد الفيتامين', task: 'تذكير', prep: 'وقت التحضير 🍳' } as const;

function hm(min: number) {
  const m = ((min % 1440) + 1440) % 1440;
  return { hour: Math.floor(m / 60), minute: m % 60 };
}

let syncing: Promise<void> = Promise.resolve();

/** Rebuild every scheduled notification from the current state. */
export function syncNotifications(s: State) {
  syncing = syncing.then(() => doSync(s)).catch(() => {});
  return syncing;
}

async function doSync(s: State) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!s.account || !s.notif.on) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;
  const lead = s.notif.lead;
  const leadNote = lead ? ` (كمان ${lead} دقايق)` : '';

  for (const r of s.reminders) {
    const taskId = `r-${r.id}`;
    await Notifications.scheduleNotificationAsync({
      identifier: taskId,
      content: {
        title: `${KIND_TITLE[r.kind]}${leadNote}`,
        body: [r.name, reminderSub(s, r)].filter(Boolean).join(' · '),
        data: { taskId },
        categoryIdentifier: CAT_TASK,
        sound: 'default',
        interruptionLevel: r.kind === 'med' ? 'timeSensitive' : 'active',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, ...hm(reminderMinute(s, r) - lead), channelId: CHANNEL },
    });
  }

  if (s.notif.water) {
    for (const hour of WATER_HOURS) {
      await Notifications.scheduleNotificationAsync({
        identifier: `water-${hour}`,
        content: { title: 'اشرب كوباية مياه 💧', body: `هدفك ${s.waterGoal} كوبايات في اليوم`, categoryIdentifier: CAT_WATER, sound: 'default' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0, channelId: CHANNEL },
      });
    }
  }

  // Meal-plan prep reminders: one-off dates for the coming 7 days.
  const now = new Date();
  for (let k = 0; k < 7 && s.week.length; k++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
    for (const t of prepTasksFor(s, todayIdx(day))) {
      const at = new Date(day.getTime() + (t.at - lead) * 60000);
      if (at <= now) continue;
      if (k === 0 && s.daily.done[t.id]) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: `${t.id}-${dateKey(day)}`,
        content: { title: `${KIND_TITLE.prep}${leadNote}`, body: `${t.title} · ${t.sub}`, data: { taskId: t.id }, categoryIdentifier: CAT_TASK, sound: 'default' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
      });
    }
  }
}

export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ميعاد الدوا 💊',
      body: 'تنبيه تجريبي من أكلات daily. جرّب تدوس مطوّل على الإشعار عشان تشوف زراير "خلصت" و"فكّرني".',
      data: { taskId: 'test' },
      categoryIdentifier: CAT_TASK,
      sound: 'default',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: CHANNEL },
  });
}
