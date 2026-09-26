/**
 * Raw design tokens.
 *
 * Everything here exists because a JS API cannot take a `className` — gradient
 * stops, shadow colours, SVG fills. Anything that *can* be expressed as a
 * utility class belongs in `tailwind.config.js` instead; keep the two in sync.
 *
 * Sources
 * ───────
 * · `design/design-system.png` §1 — the shared palette.
 * · `design/auth_screen_design.png` — the auth reference. It renders a
 *   360x800 dp screen at 2.0333x (732x1632 px of screen area), so design pixels
 *   convert to dp by dividing by 2.0333. Layout values in the screens quote the
 *   dp figure directly.
 */

/** Backgrounds — `design/design-system.png` §1. */
export const canvas = {
  /** Deepest background; also `expo.backgroundColor` in app.json. */
  deep: '#001117',
  raised: '#161822',
} as const;

/**
 * Primary CTA gradient — sampled left→right across the Sign In pill, which is
 * brightest at the leading edge and settles into cobalt on the trailing edge.
 */
export const primaryButtonGradient = ['#2BB2FF', '#0A63FE', '#0044FB'] as const;

/** Focused text field: cyan hairline plus its bloom. */
export const focus = {
  border: '#22D3EE',
  glow: '#22D3EE',
} as const;

/** Light periwinkle used by field icons and placeholder text. */
export const fieldForeground = '#9DB6E8';

/** Soft bloom painted over the artwork behind the brand mark. */
export const brandBloom = '#38BDF8';

/**
 * Backdrop scrim — the dark wash the reference lays over the hero artwork.
 *
 * `brandAssets.hero` (`design/auth_hero_image.png`) is the artwork at full
 * brightness; the auth reference paints that *same* artwork several stops
 * darker. The alphas below are measured, not guessed: sample the empty side
 * gutters (x < 32 dp, either side — no content ever reaches there) down both
 * screens and solve `hero · (1 − a) + canvas.deep · a` per row band.
 *
 *     y   0 –  8 %   a ≈ 0.62   status bar, over the artwork's darkest sky
 *     y   8 – 72 %   a ≈ 0.78   the body — the globe is at full blaze here
 *     y  72 – 90 %   a ≈ 0.46   the reference leaves the skyline lit
 *     y  90 –100 %   a ≈ 0.72   water again, below the footnote
 *
 * Without it the hero renders about four stops brighter than the mock: the
 * gutter measures `#0A55D0` in the app against `#00184x` in the reference, and
 * that alone is why every white string read flat. The field and pill fills were
 * already right — they were just competing with a blown-out background.
 *
 * The stops are `canvas.deep` (one token, two spellings — RN's gradient API
 * wants a colour string, and this is that colour at five opacities).
 */
export const backdropScrim = {
  colors: [
    'rgba(0, 17, 23, 0.62)',
    'rgba(0, 17, 23, 0.78)',
    'rgba(0, 17, 23, 0.82)',
    'rgba(0, 17, 23, 0.46)',
    'rgba(0, 17, 23, 0.72)',
  ],
  locations: [0, 0.08, 0.72, 0.9, 1],
} as const;

/** Field / social-pill hairline: brand sky at 65%, measured off the reference. */
export const hairline = 'rgba(96, 165, 250, 0.65)';
