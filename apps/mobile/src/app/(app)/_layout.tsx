import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

import { canvas } from '@/theme/tokens';

/**
 * The field UI — my-jobs, visit session, history, profile (`PLAN.md` §8.5) — and
 * the mirror of the `(auth)` guard: signed out lands on sign-in, signed in
 * passes straight through.
 *
 * Client-side guards are UX, not security, and this one is no exception. Every
 * request this group makes still has to be authorised by `apps/api` against the
 * Clerk session token (`useAuth().getToken()`), so nothing here is load-bearing
 * for what a technician is allowed to read or write.
 */
export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
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
