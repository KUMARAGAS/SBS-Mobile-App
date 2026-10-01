import { useAuth, useClerk } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { canvas } from '@/theme/tokens';

/**
 * Web-only SSO landing route — the `sso-callback` path Clerk redirects to
 * after a Google/Apple round-trip started by `useSSO().startSSOFlow()`.
 *
 * Why this file exists: `startSSOFlow` defaults its `redirectUrl` to
 * `AuthSession.makeRedirectUri({ path: 'sso-callback' })`, which on web is
 * `http://<bundler>/sso-callback?...`. Without a file at this path Expo
 * Router answered `Unmatched Route` (the `ss/err1.png` 404). On native this
 * route is never visited — `openAuthSessionAsync` intercepts the redirect
 * privately and hands `authSessionResult.url` back to `sign-in.tsx`, which
 * activates the session with `setActive()` itself.
 *
 * Why `useClerk().handleRedirectCallback()` and not
 * `AuthenticateWithRedirectCallback` from `@clerk/react`: the app's provider
 * is `@clerk/expo`'s `ClerkProvider`, which renders `InternalClerkProvider`
 * from `@clerk/react/internal`. Under Metro those are two separate module
 * instances with two separate React contexts, so the component's internal
 * `withClerk` never sees the provider and throws "can only be used within
 * the <ClerkProvider /> component". `useClerk` from `@clerk/expo` reads the
 * same context the provider wrote, so the mismatch cannot recur.
 */
export default function SSOCallbackScreen() {
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    void clerk.handleRedirectCallback({
      signInForceRedirectUrl: '/home',
      signUpForceRedirectUrl: '/home',
    });
  }, [clerk]);

  // The handshake activates the session asynchronously; the moment it flips,
  // leave — the `(app)` guard owns everything past this point. The `isLoaded`
  // gate stops a cold session-restore from flashing the spinner's route.
  if (isLoaded && isSignedIn) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: canvas.deep }}>
      <ActivityIndicator size="large" color="#F1F5F9" />
    </View>
  );
}
