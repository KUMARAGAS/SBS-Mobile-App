import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { brandAssets } from '@/theme/assets';
import { brandBloom } from '@/theme/tokens';

/**
 * The SBS orbit lockup (`design/logo.png`) with the cyan bloom the brand paints
 * behind it.
 *
 * The mark is a 2.5:1 landscape cut-out — the navy plate of `design/logo.png` is
 * keyed out by `scripts/brand/generate-logo-assets.sh` — so it is sized from the
 * width it is handed rather than from the old 91 x 127 dp portrait ribbon. That
 * width is the auth gutter column (32 dp each side, 296 dp on the design's 360 dp
 * screen) capped at 320 dp so a tablet does not blow it up; `aspectRatio` keeps
 * the height in step, so a 320 dp phone renders 256 x 102 dp instead of
 * overflowing the gutters.
 *
 * Frame and artwork are sized with `style`, not `className`: NativeWind's interop
 * registry does not cover `expo-image`, so a `className` here is dropped on
 * native and the PNG — having no intrinsic size in Yoga — renders at 0x0. That
 * was the missing mark in the emulator render.
 */
const LOGO_ASPECT = 1712 / 684; // cut-out width / height

const styles = StyleSheet.create({
  frame: { width: '100%', maxWidth: 320, aspectRatio: LOGO_ASPECT },
  artwork: { width: '100%', height: '100%' },
  bloom: {
    position: 'absolute',
    height: 300,
    width: 300,
    borderRadius: 150,
    backgroundColor: 'transparent',
    shadowColor: brandBloom,
    shadowOpacity: 0.45,
    shadowRadius: 70,
    shadowOffset: { width: 0, height: 0 },
  },
});

export function SbsLogoMark() {
  return (
    <View className="items-center justify-center" style={styles.frame}>
      {/* Bloom first so the artwork sits on top of it. */}
      <View style={styles.bloom} />
      <Image
        source={brandAssets.logoMark}
        style={styles.artwork}
        contentFit="contain"
        transition={0}
        accessibilityLabel="SBS Field Service"
      />
    </View>
  );
}
