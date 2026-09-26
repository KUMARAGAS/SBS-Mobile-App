/**
 * Single place where bundled artwork is wired up, so components never carry
 * deep `../../assets` paths.
 *
 * `require` (rather than `import`) keeps the type surface simple — Metro
 * resolves the file at bundle time and expo/types declares the global.
 */
export const brandAssets = {
  /** Full-bleed auth/onboarding backdrop — `design/auth_hero_image.png`. */
  hero: require('../../assets/images/brand/auth-hero.jpg'),
  /**
   * SBS orbit lockup — the navy plate of `design/logo.png` keyed out with a luma
   * ramp, so the artwork floats on any dark surface with no plate seam. Rebuild
   * from the master with `npm run brand:assets`
   * (`scripts/brand/generate-logo-assets.sh`).
   */
  logoMark: require('../../assets/images/brand/sbs-logo-mark.png'),
} as const;
