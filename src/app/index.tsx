import { Redirect } from 'expo-router';
import { useStore } from '@/lib/store';

/** Entry route: sends "/" to the screen that fits the saved state, so a cold start never hits a guarded route. */
export default function Index() {
  const { state } = useStore();
  if (!state.account) return <Redirect href="/welcome" />;
  return <Redirect href={state.onboarded ? '/today' : '/onboarding'} />;
}
