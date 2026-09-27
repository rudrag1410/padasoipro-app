import { Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuth } from '@/hooks';
import { AppProviders } from '@/providers/app.providers';
import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync();

/**
 * Route guards encode the onboarding order:
 * signed out -> (auth) | signed in, no profile -> profile | profile done -> (app).
 * When a guard flips (login, profile saved, logout) the router sends the user to `index`, which redirects.
 */
function RootNavigator() {
  const { status, user } = useAuth();
  const signedIn = status === 'signedIn';
  const profileDone = Boolean(user?.profileCompleted);

  if (status === 'restoring') return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !profileDone}>
        <Stack.Screen name="profile" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && profileDone}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

function SplashGate() {
  const { status } = useAuth();
  const [fontsLoaded, fontError] = useFonts({ Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });
  const ready = (fontsLoaded || Boolean(fontError)) && status !== 'restoring';

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!fontsLoaded && !fontError) return null;
  return <RootNavigator />;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <SplashGate />
    </AppProviders>
  );
}
