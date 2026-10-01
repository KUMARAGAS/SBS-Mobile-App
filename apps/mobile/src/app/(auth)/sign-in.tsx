import { useSSO } from '@clerk/expo';
import { useHostedAuth, type HostedAuthMode } from '@clerk/expo/hosted-auth';
import { User } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppleMark } from '@/components/brand/AppleMark';
import { AuthBackdrop } from '@/components/brand/AuthBackdrop';
import { GoogleMark } from '@/components/brand/GoogleMark';
import { SbsLogoMark } from '@/components/brand/SbsLogoMark';
import { AppText } from '@/components/ui/AppText';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';

/** Square edge of the provider marks inside the "continue with" pills. */
const PROVIDER_MARK_SIZE = 26;

/**
 * Which control is waiting on a browser, so exactly one of them reports the wait
 * and the rest are held inert — two half-finished sign-ins racing each other is
 * a state Clerk's own state machine has no answer for.
 */
type PendingControl = HostedAuthMode | 'google' | 'apple';

/**
 * Sign in — the app's front door, wired to the linked Clerk instance.
 *
 * Four deliberate departures from `design/auth_screen_design.png`:
 *
 *   1. **There is no password field.** The app has no password credential to
 *      collect: `PLAN.md` §9.1 puts identity in Clerk with only *Sign in with
 *      Apple* / *Sign in with Google* enabled, and provisioning is invite-only
 *      off a one-time token. So the screen asks for the identifier alone and the
 *      provider pills carry the credential exchange. "Forgot password?" went
 *      with the field it belonged to — a reset link next to no password is a
 *      dead affordance — and its slot now explains the field that is left.
 *   2. **Bigger provider marks.** 26 dp logos in 48 dp pills, up from 20 dp in
 *      38 dp, and the field and CTA grew to 48 dp to match, so the column is one
 *      stack of same-height controls.
 *   3. **A sign-up affordance the drawing never had.** It was drawn for a flow
 *      where an invitation was the only way in, so nothing on it says how a first
 *      account comes to exist; Clerk asks that an app make that visible, and
 *      Account Portal will open straight on its sign-up page when asked to. It is
 *      a line of copy rather than a fourth 48 dp pill: the column is already 763
 *      of the drawing's 800 dp, and one more pill plus its gap would put it at
 *      823. The screen scrolls, so nothing clips — the mock's composition simply
 *      stops being exact, which is the price of answering "how do I register?".
 *   4. **Brand-tinted text.** The drawing sets every string in the palette's
 *      white (`ink.DEFAULT`), which is the flattest thing on a screen whose
 *      backdrop is a bright globe under a scrim — the same complaint that made
 *      `AuthBackdrop` necessary. The wordmark and the section heading carry
 *      `text-ink-brand` (the brand cyan) and the two supporting brand lines the
 *      periwinkle `text-accent-tagline`. It is a legibility trade, not a free
 *      win: white scored 8.9:1 over the artwork behind `SBS` where the cyan
 *      scores 5.4:1 (10.6:1 against flat `canvas.deep`), so the top of the screen
 *      is AA rather than AAA now. Cyan is worth that at 42 dp and 26 dp — both
 *      clear the 3:1 large-text bar by more than 1.7x — and lower down, where the
 *      scrim is at full strength, the cyan measures 7.9:1 and reads as AAA. It
 *      stops there: the tertiary helper keeps `text-ink-muted` so it stays behind
 *      the line it explains, and every control label (`Sign In`, `Continue
 *      with…`, the field's own text) stays white because those sit on a fill, not
 *      on the artwork, where white is the legible choice.
 *
 * Both halves of the screen are live against the Clerk instance the app is linked
 * to. `Sign In` and `Create an account` open hosted Account Portal in a browser
 * sheet (`useHostedAuth`) — the UI the dashboard configures, with no password
 * collected and no native rebuild to ship — while the Google and Apple pills go
 * directly to their provider through `useSSO`. Neither path navigates on success:
 * `(auth)/_layout` owns the way out, so every route off this screen is decided in
 * one place instead of racing a layout guard.
 *
 * Everything else is still the drawing's geometry. It renders a 360x800 dp
 * screen at 2.0333x, so design px / 2.0333 gives dp and each value is snapped to
 * the nearest Tailwind step. The 42 dp field + 10 dp gap the password row freed
 * went back into the rhythm rather than out of the bottom:
 *
 *   status bar → brand mark        77 │ field height        48
 *   brand mark                     118│ field ↔ hint        12
 *   SBS / Field Service      48 / 32 │ hint                19
 *   tagline (2 × 19)               38 │ hint ↔ CTA          20
 *   tagline → "Welcome Back"       36 │ CTA                 48
 *   "Welcome Back"                 32 │ CTA ↔ Google        28
 *   "Sign in to your account"      20 │ social pill height  48
 *   subtitle → field               28 │ Google ↔ Apple      12
 *                                      Apple ↔ footnote    12
 *
 * That closes at 763 dp of content plus the 28 dp bottom inset — 791 of the 800
 * the drawing uses, with the device's top inset absorbed by the scroll view.
 *
 * The brand mark is the landscape SBS lockup (2.5:1), not the old portrait ribbon, so it takes
 * the whole gutter column — 296 x 118 dp here — and `SbsLogoMark` sizes it from the width it is
 * handed instead of a fixed height.
 *
 * The composition is a fixed column, so it scrolls on shorter devices.
 *
 * Gutters and the bottom inset live in `style`, not `className`: the web
 * capture (`scripts/ui-loop/capture.mjs`) measured this SafeAreaView's
 * `px-8`/`pb-7` as never applied — every child came out flush to x 0 — so the
 * 32 dp gutter the design asks for is stated here in plain React Native terms
 * and lands identically on web and native.
 */
const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 32, paddingBottom: 28 },
});

export default function SignInScreen() {
  const { startHostedAuth } = useHostedAuth();
  const { startSSOFlow } = useSSO();

  const [pending, setPending] = useState<PendingControl | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = pending !== null;

  /**
   * Hosted sign-in and sign-up — Clerk's Account Portal, in a browser sheet.
   *
   * This is the path the app is sold on: the instance owns which methods are
   * offered and in what order, the screen collects no password because
   * `PLAN.md` §9.1 has no password to collect, and the flow works in Expo Go,
   * on a development build and on web without three separate implementations.
   *
   * Nothing navigates on success. The browser sheet activates the session behind
   * it and `(auth)/_layout` walks the user into `(app)` as soon as
   * `isSignedIn` flips — one owner of post-auth navigation, rather than a
   * redirect racing a layout guard.
   */
  const startHosted = useCallback(
    async (mode: HostedAuthMode) => {
      setError(null);
      setPending(mode);

      try {
        await startHostedAuth({ mode });
        // A dismissed sheet resolves with `createdSessionId: null` and is
        // deliberately silent: changing your mind about signing in is not an
        // error, and telling the user so would be the screen arguing with them.
      } catch (cause) {
        setError(describeAuthFailure(cause));
      } finally {
        setPending(null);
      }
    },
    [startHostedAuth],
  );

  /**
   * The two provider pills — straight to Google or Apple, no Account Portal in
   * between.
   *
   * `useSSO` is the browser-based flow, not the native sheet: the native hooks
   * (`@clerk/expo/google`, `@clerk/expo/apple`) need a development build and
   * Apple's is iOS-only, so a pill that changed behaviour per build type would
   * be three flows wearing one label. This one is the same everywhere the app
   * runs, which is what the drawing's two pills promise.
   */
  const startProvider = useCallback(
    async (strategy: 'oauth_google' | 'oauth_apple') => {
      setError(null);
      setPending(strategy === 'oauth_google' ? 'google' : 'apple');

      try {
        const { createdSessionId, setActive, signUp } = await startSSOFlow({ strategy });

        if (createdSessionId && setActive) {
          // SSO is the one place the session is still activated by hand. Hosted
          // auth does it behind the sheet and custom flows end at `finalize()`;
          // this is neither.
          await setActive({ session: createdSessionId });
        } else if (signUp?.status === 'missing_requirements') {
          setError(
            'This account needs details the provider did not supply. Ask an administrator to check the sign-up requirements for this Clerk application.',
          );
        }
      } catch (cause) {
        setError(describeAuthFailure(cause));
      } finally {
        setPending(null);
      }
    },
    [startSSOFlow],
  );

  return (
    <View className="flex-1 bg-canvas-1">
      <AuthBackdrop />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Brand lockup */}
          <View className="items-center pt-[77px]">
            <SbsLogoMark />
            <AppText weight="bold" className="mt-1 text-display text-ink-brand">
              SBS
            </AppText>
            <AppText weight="semibold" className="text-heading text-ink-brand">
              Field Service
            </AppText>
            <AppText className="mt-2 text-center text-tagline text-accent-tagline">
              Powering Sri Lanka’s{'\n'}Infrastructure
            </AppText>
          </View>

          {/* Credentials — identifier only; there is no password to collect. */}
          <View className="mt-9">
            <AppText weight="semibold" className="text-center text-heading text-ink-brand">
              Welcome Back
            </AppText>
            <AppText className="mt-2 text-center text-label text-accent-tagline">
              Sign in to your account
            </AppText>
          </View>

          <View className="mt-7">
            <TextField
              icon={User}
              placeholder="Email or Phone Number"
              focused
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="go"
            />
            {/*
             * Takes the slot the "Forgot password?" link used to hold. What the
             * single field needs saying is not what to do when a credential is
             * lost but which identifier to type — the account binds to the Clerk
             * invitation token, not to whichever address the user picks.
             */}
            <AppText className="mt-3 text-center text-caption text-ink-muted">
              Use the email or phone from your invite.
            </AppText>
          </View>

          <View className="mt-5">
            <PrimaryButton
              label={pending === 'sign-in' ? 'Opening Clerk…' : 'Sign In'}
              onPress={() => {
                void startHosted('sign-in');
              }}
              disabled={busy}
            />
          </View>

          <View className="mt-7">
            <OutlineButton
              label={pending === 'google' ? 'Opening Google…' : 'Continue with Google'}
              icon={<GoogleMark size={PROVIDER_MARK_SIZE} />}
              onPress={() => {
                void startProvider('oauth_google');
              }}
              disabled={busy}
            />
          </View>

          <View className="mt-3">
            <OutlineButton
              label={pending === 'apple' ? 'Opening Apple…' : 'Continue with Apple'}
              icon={<AppleMark size={PROVIDER_MARK_SIZE} />}
              onPress={() => {
                void startProvider('oauth_apple');
              }}
              disabled={busy}
            />
          </View>

          {/*
           * Feedback sits with the controls that produced it, not at the top of
           * the screen. On a fresh Clerk instance the first failure is almost
           * always actionable — a social connection that is not switched on yet,
           * a callback that does not match the bundle id — so
           * `describeAuthFailure` passes Clerk's own wording through rather than
           * flattening it into "something went wrong".
           */}
          {error ? (
            <AppText
              className="mt-3 text-center text-caption text-brand-danger"
              accessibilityRole="alert"
            >
              {error}
            </AppText>
          ) : null}

          {/*
           * The one control the drawing has no room for, folded into a line of
           * copy instead of a fourth pill — see deviation 3 above.
           */}
          <Pressable
            onPress={() => {
              void startHosted('sign-up');
            }}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Create an account"
            accessibilityState={{ disabled: busy }}
            className={`mt-3 items-center${busy ? ' opacity-60' : ''}`}
          >
            <AppText className="text-center text-caption text-ink-muted">
              New to SBS?{' '}
              <AppText weight="semibold" className="text-accent">
                {pending === 'sign-up' ? 'Opening Clerk…' : 'Create an account'}
              </AppText>
            </AppText>
          </Pressable>

          {/*
           * A footnote to the button stack, not a footer. Measured off
           * `design/auth_screen_design.png`: the Apple pill ends at 696 dp and
           * this line runs 706..725 dp — a 10 dp gap with the artwork below it
           * (12 dp here, tracking the taller pills). It used to sit behind a
           * `flex-1` spacer, which pushed it down to the safe-area inset instead
           * and left it ~45 dp below the mock's composition once the artwork had
           * a size to fill.
           */}
          <AppText weight="medium" className="mt-3 text-center text-caption text-accent">
            Access by invitation only
          </AppText>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

/**
 * Turns whatever Clerk threw into one line of copy.
 *
 * Every Clerk failure — a rejected grant, a disabled social connection, the
 * `missing_requirements` branch above — arrives as an error object carrying a
 * `longMessage` meant for a human and a `message` meant for a log. This screen
 * has room for exactly one of them, and it shows the human one; anything that is
 * not a Clerk error (the sheet never opened, the device is offline) keeps its own
 * message rather than being dressed up as an authentication failure.
 */
function describeAuthFailure(cause: unknown): string {
  if (typeof cause === 'object' && cause !== null) {
    const { longMessage, message } = cause as { longMessage?: unknown; message?: unknown };

    if (typeof longMessage === 'string' && longMessage.length > 0) {
      return longMessage;
    }

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return 'Sign in could not be started. Check your connection and try again.';
}
