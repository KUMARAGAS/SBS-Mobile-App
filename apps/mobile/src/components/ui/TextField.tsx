import type { ReactNode } from 'react';
import { TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { fieldForeground, focus as focusTokens } from '@/theme/tokens';

export type TextFieldProps = {
  /** Leading Lucide line icon — the design system's icon set. */
  icon: LucideIcon;
  placeholder: string;
  /**
   * The reference renders the first field focused (cyan hairline + bloom); the
   * idle state keeps the steel-blue hairline. Presentational only for now.
   */
  focused?: boolean;
  secureTextEntry?: boolean;
  /**
   * Trailing affordance inside the pill — a clear button, a resend countdown.
   * The sign-in screen has no use for it now that the password field is gone,
   * but the primitive keeps the slot.
   */
  trailing?: ReactNode;
  /**
   * Keyboard behaviour the *screen* owns but only the field can hand to
   * `TextInput`: an email-or-phone field wants the email keyboard and no
   * auto-capitalisation, and the submit key is how "Sign In" is pressed without
   * reaching for the button.
   */
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
};

/**
 * Pill text field: 48 dp tall, fully rounded, 1 px hairline, translucent sky
 * fill — measured off `design/auth_screen_design.png` and then grown 42 → 48 dp
 * so the field, the CTA and the social pills all land on one height.
 *
 * The typed value is drawn in Inter (`font-inter-medium`, tracking baked into
 * the `text-field` token) rather than whatever the platform's `TextInput`
 * defaults to — Roboto on Android, SF on iOS — which is what made filled-in
 * text read as a stock browser input sitting in the middle of the screen's
 * typography. The caret and the selection highlight are the brand cyan:
 * `selectionColor` covers the highlight on both platforms, `cursorColor` is
 * Android's caret channel (a no-op on iOS and on `react-native-web`, which
 * filters it out rather than forwarding it to the DOM node).
 */
export function TextField({
  icon: Icon,
  placeholder,
  focused = false,
  secureTextEntry = false,
  trailing,
  keyboardType,
  autoCapitalize,
  returnKeyType,
  onSubmitEditing,
}: TextFieldProps) {
  return (
    <View
      className={`h-[48px] flex-row items-center rounded-full border pl-5 ${
        trailing ? 'pr-4' : 'pr-5'
      } ${
        focused
          ? 'border-accent bg-brand-sky/[0.16]'
          : 'border-brand-sky/65 bg-brand-sky/[0.12]'
      }`}
      style={
        focused
          ? {
              shadowColor: focusTokens.glow,
              shadowOpacity: 0.55,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
            }
          : undefined
      }
    >
      <Icon size={22} color={fieldForeground} strokeWidth={1.7} />
      <TextInput
        className="ml-3 flex-1 font-inter-medium text-field text-ink"
        placeholder={placeholder}
        placeholderTextColor={fieldForeground}
        selectionColor={focusTokens.border}
        cursorColor={focusTokens.border}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        importantForAutofill="no"
        autoCorrect={false}
      />
      {trailing}
    </View>
  );
}
