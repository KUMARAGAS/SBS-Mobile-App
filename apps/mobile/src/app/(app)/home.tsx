import { useClerk, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { LogOut, Mail, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBackdrop } from '@/components/brand/AuthBackdrop';
import { AppText } from '@/components/ui/AppText';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { fieldForeground } from '@/theme/tokens';

/** Edge of the avatar well; also the mark size inside "Sign out". */
const AVATAR_SIZE = 88;
const ACTION_MARK_SIZE = 26;

/**
 * The signed-in landing screen, and the app's "who am I" control.
 *
 * Clerk's own equivalent on a development build is the native `<UserButton />`
 * (an avatar that opens a SwiftUI/Compose profile sheet). That component renders
 * on neither web nor in Expo Go, and this app targets web as well as device —
 * `app.json` sets `web.output: static` and the UI loop captures screens through
 * it — so the avatar, the identity block and the sign-out control are built from
 * the design system instead. That keeps the first test user recognisable on
 * every platform this app builds for.
 *
 * It also stands where `PLAN.md` §8.5 puts my-jobs: `/home` is the guarded
 * group's landing route, so it is the honest place to say what has and has not
 * been built yet rather than implying the crew's job board is behind it.
 */
export default function HomeScreen() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();

  /*
   * `(app)/_layout` has already settled that a session exists, but `user` is a
   * separate resource that arrives a moment later. Blank rather than a skeleton:
   * the alternative is a screen that paints its whole layout twice for one frame.
   */
  if (!isLoaded || !user) {
    return <View className="flex-1 bg-canvas-1" />;
  }

  const email = user.primaryEmailAddress?.emailAddress;
  const name = user.fullName ?? user.username ?? email ?? 'Signed in';

  return (
    <View className="flex-1 bg-canvas-1">
      <AuthBackdrop />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View className="items-center pt-10">
          <View
            className="items-center justify-center overflow-hidden rounded-full border border-brand-sky/50 bg-brand-sky/[0.12]"
            style={styles.avatarWell}
          >
            {/*
             * `expo-image` is not registered with NativeWind's interop layer, so
             * this one is sized with `style`: a `className` here is dropped on
             * native and the avatar renders at 0x0 — the same trap `SbsLogoMark`
             * documents.
             */}
            {user.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={0}
                accessibilityLabel={name}
              />
            ) : (
              <AppText weight="bold" className="text-heading text-ink">
                {initialsOf(name)}
              </AppText>
            )}
          </View>

          <AppText weight="bold" className="mt-5 text-center text-heading text-ink">
            {name}
          </AppText>

          {email ? (
            <AppText className="mt-1 text-center text-label text-ink-subtle">{email}</AppText>
          ) : null}

          <View className="mt-3 flex-row items-center gap-2 rounded-full border border-brand-sky/40 bg-brand-sky/[0.08] px-3 py-1">
            <ShieldCheck size={14} color={fieldForeground} strokeWidth={2} />
            <AppText className="text-caption text-ink-subtle">Signed in with Clerk</AppText>
          </View>
        </View>

        <View className="mt-9 gap-3">
          <DetailRow icon={Mail} label="Primary email" value={email ?? 'Not set'} />
          <DetailRow icon={ShieldCheck} label="Clerk user id" value={user.id} />
        </View>

        <View className="flex-1" />

        <OutlineButton
          label="Sign out"
          icon={<LogOut size={ACTION_MARK_SIZE} color="#FFFFFF" strokeWidth={2} />}
          onPress={() => {
            // The guard on `(app)/_layout` walks to `/sign-in` once the session
            // clears, so this deliberately navigates nothing itself.
            void signOut();
          }}
        />

        <AppText className="mt-4 text-center text-caption text-ink-muted">
          My Jobs, visit sessions and history land here (`PLAN.md` §8.5).
        </AppText>
      </SafeAreaView>
    </View>
  );
}

/**
 * Gutters and the bottom inset live in `style` rather than `className`, matching
 * the sign-in screen: `scripts/ui-loop/capture.mjs` measured `SafeAreaView`'s
 * `px-*`/`pb-*` as never applied on web (every child came out flush to x 0), so
 * the 32 dp gutter is stated in plain React Native terms and lands identically
 * on both platforms.
 */
const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 32, paddingBottom: 28 },
  avatarWell: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarImage: { width: '100%', height: '100%' },
});

/** Up to two initials, for the account that has no profile picture yet. */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  const letters = words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[1][0]}`;

  return letters.toUpperCase();
}

/** One label/value row of the account card. */
function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-brand-sky/30 bg-white/[0.03] px-4 py-3">
      <Icon size={18} color={fieldForeground} strokeWidth={1.7} />
      <View className="flex-1">
        <AppText className="text-caption text-ink-muted">{label}</AppText>
        <AppText
          weight="medium"
          className="text-label text-ink"
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {value}
        </AppText>
      </View>
    </View>
  );
}
