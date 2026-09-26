import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

import { canvas } from '@/theme/tokens';

/**
 * Sign-in / invitation acceptance / onboarding — reachable only while signed
 * out.
 *
 * The guard sits on the group rather than on each screen because the whole group
 * is public-or-not together, and because one redirect covers every route that
 * can land inside it. It also owns the way *out*: once a flow activates a
 * session, `isSignedIn` flips and this layout walks the user into `(app)` — so
 * no screen has to navigate after authenticating, which is what keeps the
 * browser-sheet flows to a single owner of navigation.
 *
 * `isLoaded` is checked before `isSignedIn` deliberately. Clerk restores the
 * session from the keychain a frame or two after launch, so testing the flag
 * before it has settled would read a returning technician as signed out, bounce
 * them to sign-in, and then race them back out again.
 *
 * `null` while that read is in flight: the native splash is already down by this
 * point (`_layout.tsx` hides it once Inter loads), and the alternative is a
 * flash of the sign-in artwork immediately before it is replaced.
 */
export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: canvas.deep },
      }}
    />
  );
}
