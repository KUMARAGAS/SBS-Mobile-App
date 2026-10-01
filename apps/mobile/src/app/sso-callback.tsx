import { useAuth } from '@clerk/expo';
import { AuthenticateWithRedirectCallback } from '@clerk/react';
import { Redirect } from 'expo-router';
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
 * Why `@clerk/react`, not `@clerk/expo`: the installed `@clerk/expo@4.7.1`
 * bundle exports no callback component (`controlComponents` re-exports only
 * `ClerkLoaded/ClerkLoading/RedirectToTasks/Show`; `web/uiComponents` only
 * the prebuilt UI set). Its own dependency is `@clerk/react ^6.17.2`
 * (hoisted alongside it), whose `AuthenticateWithRedirectCallback` calls
 * `clerk.handleRedirectCallback()` on mount — the same instance the
 * `ClerkProvider` in `_layout.tsx` owns. `useAuth` still comes from
 * `@clerk/expo`, like every other screen. The component renders null (no
 * DOM), so it is safe on `react-native-web`.
 */
export default function SSOCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  // The handshake activates the session asynchronously; the moment it flips,
  // leave — the `(app)` guard owns everything past this point. The `isLoaded`
  // gate stops a cold session-restore from flashing the spinner's route.
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
