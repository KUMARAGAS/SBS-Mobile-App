import Svg, { Path } from 'react-native-svg';

import type { BrandMarkProps } from './GoogleMark';

/** Apple mark, rendered in the foreground colour (white in the reference). */
export function AppleMark({ size = 20 }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#FFFFFF"
        d="M17.05 12.54c-.02-2.35 1.92-3.48 2.01-3.54-1.1-1.6-2.8-1.82-3.4-1.84-1.45-.15-2.83.85-3.56.85-.73 0-1.87-.83-3.08-.81-1.58.02-3.04.92-3.86 2.33-1.65 2.86-.42 7.09 1.18 9.41.79 1.13 1.72 2.4 2.95 2.35 1.19-.05 1.63-.76 3.07-.76 1.43 0 1.83.76 3.08.74 1.27-.02 2.08-1.15 2.86-2.29.9-1.31 1.27-2.59 1.29-2.66-.03-.01-2.47-.95-2.5-3.78M14.6 4.44c.65-.79 1.09-1.88.97-2.97-.94.04-2.07.62-2.74 1.4-.6.69-1.13 1.81-.99 2.88 1.05.08 2.11-.53 2.76-1.31"
      />
    </Svg>
  );
}
