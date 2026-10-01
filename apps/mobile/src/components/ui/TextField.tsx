import type { ReactNode } from 'react';
import { TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { fieldForeground, focus as focusTokens, focusGlow } from '@/theme/tokens';

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
 * The typed value is drawn in Manrope (`font-body-medium`, tracking baked into
 * the `text-field` token) rather than whatever the platform's `TextInput`
 * defaults to — Roboto on Android, SF on iOS — which is what made filled-in
 * text read as a stock browser input sitting in the middle of the screen's
 * typography. The caret and the selection highlight are the brand cyan:
 * `selectionColor` covers the highlight on both platforms, `cursorColor` is
 * Android's caret channel (a no-op on iOS and on `react-native-web`, which
 * filters it out rather than forwarding it to the DOM node).
 *
 * `min-w-0` on the `TextInput` is load-bearing on `react-native-web`, and inert
 * everywhere else. The row is `pl-5` → 22 dp icon → `ml-3` → input at `flex-1`,
 * and the browser gives an `<input>` an intrinsic width derived from the *current
 * font's* metrics (its default ~20-character box) before flex runs. Under
 * `min-width: auto` that width is a floor, so a face whose 20-character box
 * exceeds the 220 dp left over takes the deficit out of the icon instead — the
 * icon shrinks to nothing and the placeholder starts under it. That is not
 * hypothetical: on the Inter face the input's box began at 65 dp, which is
 * exactly the icon's own origin, and the icon measured zero-width glyph ink.
 * `min-w-0` returns the floor to 0 so `flex-1` alone decides, which is what
 * React Native already does natively — and it stops the field's layout from
 * depending on which typeface happens to be loaded.
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
        /*
         * `boxShadow` rather than the `shadow*` quartet, for the same two
         * reasons as the brand bloom: react-native-web 0.21 deprecates the
         * shadow props (`"shadow*" style props are deprecated. Use
         * "boxShadow".`), and a translucent, childless field has no iOS layer
         * alpha for them to cast from — so the glow only ever painted on web.
         */
        focused ? { boxShadow: `0px 0px 10px 0px ${focusGlow}` } : undefined
      }
    >
      <Icon size={22} color={fieldForeground} strokeWidth={1.7} />
      <TextInput
        className="ml-3 min-w-0 flex-1 font-body-medium text-field text-ink"
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
