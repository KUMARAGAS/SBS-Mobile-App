import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { brandAssets } from '@/theme/assets';
import { backdropScrim, brandBloom } from '@/theme/tokens';

/**
 * Full-bleed auth backdrop, in three layers:
 *
 *   1. the SBS hero artwork (`design/auth_hero_image.png`), at full brightness;
 *   2. the scrim that brings it down to the reference's exposure — the measured
 *      alphas and the reasoning behind them live on `backdropScrim`;
 *   3. the soft radial bloom the reference centres on the brand mark.
 *
 * The scrim is *under* the bloom deliberately. The reference keeps a lit halo
 * where the mark and its ring land, so the bloom is what lifts that one region
 * back up; stacking it the other way round washes the halo out with everything
 * else and the composition goes flat.
 *
 * Takes no pointer events — the screen above it owns all interaction.
 *
 * The artwork is sized with `style`, not `className`: NativeWind's interop
 * registry covers React Native's own primitives but not `expo-image`, so a
 * `className` on this `<Image>` is dropped on native and the artwork — which
 * has no intrinsic size in Yoga — collapses to 0x0 and never appears. That was
 * the missing hero in the emulator render. `style` works on both platforms. The
 * same goes for `LinearGradient`, which is registered by neither interop nor
 * `nativewind/preset` — hence `styles.scrim` rather than `absolute inset-0`.
 */
const styles = StyleSheet.create({
  artwork: { width: '100%', height: '100%' },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});

export function AuthBackdrop() {
  return (
    <View className="absolute inset-0 bg-canvas-1" pointerEvents="none">
      <Image source={brandAssets.hero} style={styles.artwork} contentFit="cover" transition={0} />

      <LinearGradient
        colors={backdropScrim.colors}
        locations={backdropScrim.locations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrim}
      />

      <View className="absolute inset-0">
        <Svg width="100%" height="100%">
          <Defs>
            {/*
             * Stronger than the pre-scrim 0.28/0.09 pair: the bloom now lands on
             * a field roughly four stops darker, so it has to carry more of its
             * own weight to hold the reference's halo around the mark.
             */}
            <RadialGradient id="brandBloom" cx="50%" cy="21%" rx="55%" ry="30%">
              <Stop offset="0" stopColor={brandBloom} stopOpacity="0.34" />
              <Stop offset="0.55" stopColor={brandBloom} stopOpacity="0.11" />
              <Stop offset="1" stopColor={brandBloom} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#brandBloom)" />
        </Svg>
      </View>
    </View>
  );
}
