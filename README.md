# Aklat Daily (أكلات daily)

Your personal AI food concierge. **من هناكل إيه؟ لـ يلا ناكل**

Expo (SDK 58) + Expo Router + TypeScript. Arabic, right-to-left.

## What's in v0.1

- **Sign-up, login, forgot password**: accounts are stored on the device only for now. Supabase Auth comes next.
- **Onboarding**: who's eating (solo, couple, family), your tastes, household members, and a notification permission request.
- **Today**: today's lunch and dinner, swap a meal, favourites, and the next task.
- **Week**: a Saturday-to-Friday plan that avoids anything a household member doesn't eat.
- **مهامي (daily tasks)**, with real local notifications:
  - Medicine, vitamins and personal tasks. Times are tied to meals: on an empty stomach, before, with or after a meal, or at a fixed time. They repeat daily.
  - Water reminders every two hours, plus a glass tracker.
  - Cooking-prep and "take it out of the freezer" reminders, generated from the meal plan for the next 7 days.
  - "Done ✓" and "Remind me in 10 minutes" buttons on the notification itself.
  - Notify on time, or 5 or 15 minutes early.
- **البيت (household)**: each member's likes and dislikes. The free plan allows you plus 2 people.

## Run it on your iPhone

1. Install **Expo Go** from the App Store.
2. On your computer:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code with the iPhone camera. The app opens in Expo Go.
4. On first launch the app switches to right-to-left and reloads once.
5. Open **مهامي** and tap **جرّب إشعار** (test notification). Then lock the phone. The notification arrives after 5 seconds. Long-press it to see the action buttons.

Expo Go logs a warning that `expo-notifications` is "not fully supported". Local notifications still work on iOS in Expo Go. Remote push (family sharing, server messages) needs a development build: `npx eas-cli@latest build --profile development --platform ios`.

## Code map

| Path | What |
|---|---|
| `src/app/` | Screens (Expo Router). `(auth)` = welcome, signup, login, forgot. `(tabs)` = today, week, tasks, home. |
| `src/lib/model.ts` | State types, meal planning, daily task list. |
| `src/lib/notifications.ts` | Permission, categories (action buttons), scheduling, snooze. |
| `src/lib/store.tsx` | App state, AsyncStorage persistence, rescheduling on change. |
| `src/lib/catalog.ts` | Meal catalog with ingredients (for 4 people). |

## Next

1. Supabase: real accounts, and a household shared between devices.
2. AI meal suggestions and recipes (Claude API, server-side).
3. Aklat+: recipes, shopping list, kitchen inventory; subscriptions via RevenueCat.
4. Push notifications between household members (development build + Expo Push).
