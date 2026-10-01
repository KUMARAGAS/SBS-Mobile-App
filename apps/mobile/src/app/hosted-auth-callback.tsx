import { useAuth, useClerk } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
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
 * Like `sso-callback.tsx`, the handshake runs through `useClerk()` from
 * `@clerk/expo` — never `AuthenticateWithRedirectCallback` from
 * `@clerk/react`, whose separate React context cannot see this app's
 * provider. `Redirect` to `/home` is gated on `isSignedIn` flipping.
 */
export default function HostedAuthCallbackScreen() {
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    void clerk.handleRedirectCallback({
      signInForceRedirectUrl: '/home',
      signUpForceRedirectUrl: '/home',
    });
  }, [clerk]);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: canvas.deep }}>
      <ActivityIndicator size="large" color="#F1F5F9" />
    </View>
  );
}
