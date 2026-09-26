import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';

/**
 * Entry route — the fork between the two halves of the app.
 *
 * `PLAN.md` §8.5 has `(auth)` owning sign-in, invitation acceptance and
 * onboarding, and `(app)` owning the field UI behind it; this is the decision of
 * which side a cold start belongs to. Both group layouts guard themselves as
 * well, so a deep link into either half never passes through here — this only
 * answers for the bare `/` the launch screen lands on.
 *
 * `isLoaded` is read before `isSignedIn`, and `null` is returned until it
 * settles: Clerk is still pulling the session out of the keychain on the first
 * frame, and treating "not signed in *yet*" as "signed out" is exactly what
 * makes a returning technician watch the sign-in screen flash past on every
 * launch.
 */
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return <Redirect href={isSignedIn ? '/home' : '/sign-in'} />;
}

