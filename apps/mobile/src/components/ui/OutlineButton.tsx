import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { AppText } from './AppText';

export type OutlineButtonProps = {
  label: string;
  /** Brand mark rendered to the left of the label. */
  icon: ReactNode;
  onPress?: () => void;
  /** Same contract as `PrimaryButton.disabled` — see the note there. */
  disabled?: boolean;
};

/**
 * Secondary/"continue with" pill: 48 dp tall with the steel-blue hairline and a
 * barely-there translucent fill, as in `design/auth_screen_design.png`.
 *
 * The reference pill is 38 dp with a 20 dp mark; both grew, to 48 dp and the
 * 26 dp the screen hands in as `icon`. A provider button whose logo is the
 * smallest thing in it is the one control the eye skips, and the pill now lines
 * up with the field and the CTA above it instead of floating between them.
 *
 * Mark and label stay a centred group rather than the mark being pinned to the
 * leading edge: two labels within a character or two of each other ("…Google",
 * "…Apple") put the group within ~3 dp of the same x on both pills, and the
 * measured reference centres them too. The label steps up from `caption` to
 * `label` so it still reads at the larger pill height.
 */
export function OutlineButton({ label, icon, onPress, disabled = false }: OutlineButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`h-[48px] flex-row items-center justify-center gap-3 rounded-full border border-brand-sky/65 bg-white/[0.03] px-5${
        disabled ? ' opacity-60' : ''
      }`}
    >
      {icon}
      <AppText weight="medium" className="text-label text-white">
        {label}
      </AppText>
    </Pressable>
  );
}
