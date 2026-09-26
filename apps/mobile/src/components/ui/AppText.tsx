import { Text, type TextProps } from 'react-native';

/**
 * All copy renders through here.
 *
 * React Native does not inherit `fontFamily` from parent views, and Inter ships
 * one file per weight, so every string would otherwise need to remember to name
 * its weight class. `weight` keeps that in one place.
 */
const weightClass = {
  regular: 'font-inter',
  medium: 'font-inter-medium',
  semibold: 'font-inter-semibold',
  bold: 'font-inter-bold',
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
