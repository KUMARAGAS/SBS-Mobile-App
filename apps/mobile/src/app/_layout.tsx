import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, useFonts } from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { canvas } from '@/theme/tokens';

import '../../global.css';

// Hold the native splash until Manrope is ready, so no screen ever paints in a
// fallback face (React Native cannot synthesise weights for a custom family —
// see tailwind.config.js).
SplashScreen.preventAutoHideAsync();

/**
 * Clerk publishable key, handed to the provider explicitly.
 *
 * It is read here and passed as a prop rather than left to the SDK because Metro
 * only inlines `EXPO_PUBLIC_`-prefixed variables into the bundle *at build
 * time*: a `process.env` read that happens inside `node_modules` is never
 * replaced in a release bundle and would come back empty on device.
 *
 * The prefix is also what makes the key public — it is the same value a browser
 * would show — so shipping it is intended. Its counterpart, `CLERK_SECRET_KEY`,
 * belongs to `apps/api` alone and must never reach this package.
 */
const publishableKey = readPublishableKey(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);

/**
 * Throws instead of rendering an apology, unlike the font failure below.
 *
 * There is no partial app to fall back to without an identity provider — every
 * route behind `(auth)`/`(app)` is gated on a session that cannot exist — and a
 * failure at import time names the fix in the one place a developer looks,
 * rather than leaving a sign-in screen whose every control is dead.
 */
function readPublishableKey(key: string | undefined): string {
  if (key) {
    return key;
  }

  throw new Error(
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Add it to apps/mobile/.env ' +
      '(Clerk Dashboard → API keys → Quick Copy), or run `clerk env pull` from this directory.',
  );
}

export default function RootLayout() {
  // The second tuple member is the load failure, and it used to be dropped.
  // `global.css` plus these four files are the only things between the native
  // splash and the first screen, so an ignored failure here meant a splash that
  // never hid: a blank app with nothing in the dev-server log to explain it.
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // A rejected load never resolves, so waiting on `fontsLoaded` would wait
  // forever — release the splash and render the reason instead.
  const fontsFailed = fontError != null;

  useEffect(() => {
    if (fontError) {
      console.error('[RootLayout] Manrope failed to load — see the error below.', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded || fontsFailed) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsFailed]);

  if (fontsFailed) {
    return <FontLoadFailedScreen reason={fontError} />;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    /*
     * `tokenCache` is the difference between staying signed in and not: it keeps
     * the session in the device keychain (`expo-secure-store`, `AFTER_FIRST_UNLOCK`)
     * instead of in memory, so a technician who kills the app mid-shift is not
     * asked to authenticate again. On web it is `undefined` and Clerk falls back
     * to its own storage, so no platform branching is needed here.
     *
     * Nothing else is configured on purpose. `ClerkProvider` already calls
     * `WebBrowser.maybeCompleteAuthSession()` for the browser-based flows and
     * already wires the OAuth transfer path, so adding either by hand is
     * documented as a bug, not as belt-and-braces.
     */
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: canvas.deep },
        }}
      />
    </ClerkProvider>
  );
}

/**
 * Last-resort screen for a font failure.
 *
 * Styled with inline `style` rather than NativeWind on purpose: this path only
 * runs when something upstream already went wrong, so it must not depend on the
 * CSS interop layer that the rest of the app relies on. It exists so a startup
 * failure is *visible* — a silent blank screen gives nothing to act on.
 */
function FontLoadFailedScreen({ reason }: { reason: Error }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 32,
        backgroundColor: canvas.deep,
      }}
    >
      <Text style={{ color: '#F1F5F9', fontSize: 18, fontWeight: '600' }}>
        Manrope failed to load
      </Text>
      <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>
        Every string in the app names a Manrope weight, so nothing can render
        without these files.
      </Text>
      <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center' }}>
        {reason.message}
      </Text>
    </View>
  );
}

