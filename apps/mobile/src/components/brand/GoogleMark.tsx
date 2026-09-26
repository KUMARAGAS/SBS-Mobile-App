import Svg, { Path } from 'react-native-svg';

export type BrandMarkProps = {
  /** Square edge length in dp. */
  size?: number;
};

/** Google "G", four-colour. */
export function GoogleMark({ size = 20 }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.04 12.26c0-.83-.07-1.63-.21-2.4H12v4.54h6.19a5.29 5.29 0 0 1-2.3 3.47v2.89h3.72c2.18-2 3.43-4.96 3.43-8.5Z"
      />
      <Path
        fill="#34A853"
        d="M12 23.5c3.11 0 5.72-1.03 7.61-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.89 1.1-2.99 0-5.52-2.02-6.43-4.74H1.72v2.98A11.49 11.49 0 0 0 12 23.5Z"
      />
      <Path fill="#FBBC05" d="M5.57 14.18a6.9 6.9 0 0 1 0-4.41V6.79H1.72a11.5 11.5 0 0 0 0 10.37l3.85-2.98Z" />
      <Path
        fill="#EA4335"
        d="M12 5.03c1.69 0 3.2.58 4.4 1.72l3.29-3.29A11.5 11.5 0 0 0 1.72 6.79l3.85 2.98C6.48 7.05 9.01 5.03 12 5.03Z"
      />
    </Svg>
  );
}
