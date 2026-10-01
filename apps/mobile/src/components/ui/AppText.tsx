import { Text, type TextProps } from 'react-native';

/**
 * All copy renders through here.
 *
 * React Native does not inherit `fontFamily` from parent views, and Manrope ships
 * one file per weight, so every string would otherwise need to remember to name
 * its weight class. `weight` keeps that in one place — and the classes it names
 * (`font-body*`) stay true whatever face `tailwind.config.js` points them at.
 */
const weightClass = {
  regular: 'font-body',
  medium: 'font-body-medium',
  semibold: 'font-body-semibold',
  bold: 'font-body-bold',
} as const;

export type AppTextWeight = keyof typeof weightClass;

export type AppTextProps = TextProps & {
  weight?: AppTextWeight;
};

export function AppText({ weight = 'regular', className, ...rest }: AppTextProps) {
  return (
    <Text
      className={className ? `${weightClass[weight]} ${className}` : weightClass[weight]}
      {...rest}
    />
  );
}
