import { useEffect } from 'react';
import { DevSettings, I18nManager } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Lalezar_400Regular } from '@expo-google-fonts/lalezar';
import {
  IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { StoreProvider, useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// The app is Arabic-first. Native builds force RTL through the expo-localization
// plugin; in Expo Go we force it here and reload once so the layout flips.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  if (__DEV__) setTimeout(() => DevSettings.reload(), 50);
}

function RootStack() {
  const { ready, state } = useStore();
  const signedIn = !!state.account;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !state.onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && state.onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-reminder" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lalezar_400Regular, IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold,
  });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <RootStack />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
