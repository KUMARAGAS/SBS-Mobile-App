/** @type {import('tailwindcss').Config} */
/**
 * SBS Field Service design tokens.
 *
 * · Palette  — `design/design-system.png` §1 "Color Palette".
 * · Accents  — sampled from `design/auth_screen_design.png`, which renders a
 *              360x800 dp screen at 2.0333x (732x1632 px of screen area).
 *
 * Values that have to be handed to a JS API (gradient stops, shadows, SVG
 * fills) live in `src/theme/tokens.ts` — keep the two in sync.
 *
 * Note on fonts: Inter ships as one file per weight and React Native does not
 * synthesise weights for a custom family, so each weight is its own family
 * (`font-inter-medium`, …) rather than a `font-weight` utility.
 */
const colors = {
  brand: {
    primary: '#1E2A3A',
    cobalt: '#2563EB',
    sky: '#3B82F6',
    cyan: '#60A5FA',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  canvas: { 1: '#001117', 2: '#161822' },
  glass: { 1: '#1C2333', 2: '#1E2A3A' },
  hairline: '#475569',
  ink: { DEFAULT: '#F1F5F9', muted: '#94A3B8', subtle: '#CBD5E1' },
  accent: {
    DEFAULT: '#22D3EE',
    glow: '#1FC3FF',
    placeholder: '#9DB6E8',
    tagline: '#A9C7F5',
  },
};

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
      fontSize: {
        // Auth reference sizes, straight off design/auth_screen_design.png.
        display: ['42px', { lineHeight: '48px', letterSpacing: '0.2px' }],
        heading: ['26px', { lineHeight: '32px', letterSpacing: '-0.2px' }],
        // Typed input text: 16 dp with a hair of tracking, so a filled-in field
        // does not fall back to the platform default face and read as a stock
        // browser input (see `TextField`).
        field: ['16px', { lineHeight: '21px', letterSpacing: '0.2px' }],
        label: ['15px', { lineHeight: '20px' }],
        tagline: ['15px', { lineHeight: '19px', letterSpacing: '0.1px' }],
        caption: ['14px', { lineHeight: '19px' }],
      },
    },
  },
  plugins: [],
};


