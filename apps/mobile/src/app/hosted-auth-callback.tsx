import { useAuth } from '@clerk/expo';
import { AuthenticateWithRedirectCallback } from '@clerk/react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { canvas } from '@/theme/tokens';

/**
 * Web-only hosted-auth landing route — the `hosted-auth-callback` path the
 * browser sheet returns to after a `Sign In` / `Create an account` round-trip
 * started by `useHostedAuth().startHostedAuth()`.
 *
 * Why this file exists: `startHostedAuth` defaults its web `redirectUrl` to
 * `AuthSession.makeRedirectUri({ path: 'hosted-auth-callback' })` (see
 * `node_modules/@clerk/expo/dist/hooks/useHostedAuth.js` →
 * `getDefaultRedirectUrl`), which on web is
 * `http://<bundler>/hosted-auth-callback?...`. Without a file at this path
 * Expo Router would answer `Unmatched Route` — the same 404 `ss/err1.png`
 * showed for `sso-callback`. On native this route is never visited:
 * `openAuthSessionAsync` intercepts the `clerk://<package>.hosted-callback`
 * redirect privately and `startHostedAuth` activates the session with
 * `clerk.setActive()` itself.
 *
 * Implementation mirrors `sso-callback.tsx`: the handshake activating the
 * session is asynchronous, so `Redirect` to `/home` is gated on `isSignedIn`
 * flipping rather than on the callback component (which renders null).
 */
export default function HostedAuthCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: canvas.deep }}>
      <AuthenticateWithRedirectCallback signInForceRedirectUrl="/home" signUpForceRedirectUrl="/home" />
      <ActivityIndicator size="large" color="#F1F5F9" />
    </View>
  );
}
