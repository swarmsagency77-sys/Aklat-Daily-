import { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/lib/theme';

export const unstable_settings = { initialRouteName: 'today' };

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color as string} size={size} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orangeInk,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.ivory },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'النهاردة', tabBarIcon: icon('restaurant-outline') }} />
      <Tabs.Screen name="week" options={{ title: 'الأسبوع', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="tasks" options={{ title: 'مهامي', tabBarIcon: icon('alarm-outline') }} />
      <Tabs.Screen name="home" options={{ title: 'البيت', tabBarIcon: icon('people-outline') }} />
    </Tabs>
  );
}
