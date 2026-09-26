import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { primaryButtonGradient } from '@/theme/tokens';

export type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  /**
   * Held while a flow is in the air. The press target stays mounted — unmounting
   * it would collapse the column and move the other controls under the user's
   * thumb — but it stops accepting presses and dims enough to read as
   * unavailable rather than broken.
   */
  disabled?: boolean;
};

/**
 * Primary CTA: 48 dp cobalt→sky pill with a trailing arrow, matching the Sign
 * In button in `design/auth_screen_design.png` — at 42 dp in the drawing, grown
 * to 48 so the CTA, the text field and the "continue with" pills are one height
 * and the column reads as a single stack of controls.
 *
 * The gradient carries its own layout in `style` rather than `className`, and
 * that is deliberate: NativeWind only maps `className` for React Native's own
 * primitives (`react-native-css-interop/dist/runtime/components.js` registers
 * View/Text/TextInput/Image/Pressable/ScrollView/… plus SafeAreaView) and
 * nothing in it registers `expo-linear-gradient`. On native the className was
 * therefore dropped entirely — no 42 dp height and no `flex-row`, so the label
 * and arrow fell back to React Native's default column and stacked, which is
 * the overflowing "Sign In" the emulator showed. `style` lands on both
 * platforms. The `Pressable` below *is* a primitive, so it keeps its classes.
 */
const styles = StyleSheet.create({
  gradient: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`overflow-hidden rounded-full${disabled ? ' opacity-60' : ''}`}
    >
      <LinearGradient
        colors={primaryButtonGradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        <AppText weight="semibold" className="text-label text-white">
          {label}
        </AppText>
        <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
      </LinearGradient>
    </Pressable>
  );
}
