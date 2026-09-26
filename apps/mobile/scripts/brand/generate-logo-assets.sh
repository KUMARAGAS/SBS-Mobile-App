#!/usr/bin/env bash
#
# Rebuild every SBS brand image the app ships from `design/logo.png`.
#
# The master artwork (`design/logo.png`, 1905x826) is a flat dark-navy card with
# the blue "SBS" orbit lockup on it and **no alpha channel**, so this script keys
# the navy plate out first and then paints the cut-out onto every surface:
#
#   design/logo.png ──key──▶ cut-out (transparent)
#                              ├─▶ assets/images/brand/sbs-logo-mark.png    in-app mark
#                              ├─▶ assets/images/brand/sbs-logo-lockup.png  brand kit
#                              ├─▶ assets/images/icon.png                   launcher / store
#                              ├─▶ assets/images/splash-icon.png            expo-splash-screen
#                              ├─▶ assets/images/favicon.png                web
#                              ├─▶ assets/images/android-icon-*.png         adaptive layers
#                              └─▶ assets/expo.icon/Assets/sbs-logo.png     iOS Icon Composer
#
# Keying: the plate's own luma peaks at ~20/255 and the artwork starts at
# ~31/255 — only 0.24% of all pixels fall in between — so a luma ramp of
# 20/255 → 31/255 lifts the lockup out with clean anti-aliased edges. Compositing
# the cut-out back onto the plate colour reproduces `design/logo.png` at RMSE
# 1.3%: the artwork itself is untouched, only the plate is removed.
#
# Opaque surfaces use `#001117` (`canvas-1`, also `expo.backgroundColor`) instead
# of the plate's own `srgb(1,14,29)`: the two navies are within 6/255 on every
# channel, so the brand reads as one colour and the launcher matches the app.
#
# `assets/expo.icon/icon.json` is authored by hand (Icon Composer owns that file)
# and is never rewritten here — only the layer image it names.
#
# Usage:  bash scripts/brand/generate-logo-assets.sh      (needs ImageMagick 7)
set -euo pipefail

cd "$(dirname "$0")/../.."              # → apps/mobile

SRC=design/logo.png
IMAGES=assets/images
BRAND=$IMAGES/brand
ICON_ASSETS=assets/expo.icon/Assets

CANVAS='#001117'                        # canvas-1 / expo.backgroundColor
T0=0.0784                               # 20/255 — plate luma ceiling
T1=0.1216                               # 31/255 — artwork luma floor

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$BRAND" "$ICON_ASSETS"

# --- 1. Key the navy plate out ---------------------------------------------
# alpha = clamp((luma - T0) / (T1 - T0)); `intensity` is the pixel's intensity in
# the single-channel grayscale copy of the plate.
echo "keying $SRC"
convert "$SRC" -alpha off -colorspace Gray \
        -fx "(intensity-$T0)/($T1-$T0)" "$WORK/alpha.png"
convert "$SRC" -alpha off "$WORK/plate.png"
# CopyOpacity takes the ramp as the matte; trim drops the transparent border but
# keeps the lockup's own soft glow.
convert "$WORK/plate.png" "$WORK/alpha.png" -alpha off -compose CopyOpacity \
        -composite -trim +repage "$WORK/cutout.png"

# --- 2. In-app mark + brand kit --------------------------------------------
# 1200 px wide is ~4x the 320 dp cap `SbsLogoMark` renders at, so the mark stays
# crisp on a 3x screen without shipping the master's full 1712 px width.
convert "$WORK/cutout.png" -resize 1200x -strip "$BRAND/sbs-logo-mark.png"
# The kit copy keeps the old lockup file's approximate width (1677 px) so any
# external reference to the file keeps its footing.
convert "$WORK/cutout.png" -resize 1677x -strip "$BRAND/sbs-logo-lockup.png"

# --- 3. Launcher / store icon ---------------------------------------------
# 1024², lockup centred with an 8% margin. Apple asks for a little more on a
# full-bleed square, but a 2.5:1 lockup that only spans 76% of the canvas reads
# as a thumbnail, so it takes all the room the squircle/mask can spare.
convert -size 1024x1024 "xc:$CANVAS" \
        \( "$WORK/cutout.png" -resize 860x \) -gravity center -composite \
        -strip "$IMAGES/icon.png"

# --- 4. Splash -------------------------------------------------------------
# Transparent cut-out; `expo-splash-screen` scales it by `imageWidth` (app.json)
# and paints `backgroundColor` behind it.
convert "$WORK/cutout.png" -resize 1024x -strip "$IMAGES/splash-icon.png"

# --- 5. Web favicon -------------------------------------------------------
convert -size 48x48 "xc:$CANVAS" \
        \( "$WORK/cutout.png" -resize 46x \) -gravity center -composite \
        -strip "$IMAGES/favicon.png"

# --- 6. Android adaptive icon --------------------------------------------
# Foreground: 288 px of the 512² canvas is as wide as the lockup can go and still
# sit inside the 66/108 dp safe circle every launcher shape is guaranteed to show
# (its corners land at radius 155 px of the 156 px allowed).
convert -size 512x512 xc:none \
        \( "$WORK/cutout.png" -resize 288x \) -gravity center -composite \
        -strip "$IMAGES/android-icon-foreground.png"
convert -size 512x512 "xc:$CANVAS" -strip "$IMAGES/android-icon-background.png"
# Monochrome: the cut-out's alpha *is* the stencil — Android supplies the tint.
# Same 56% of the canvas as the foreground so the two layers register.
convert "$WORK/cutout.png" -resize 243x -channel RGB -fill white -colorize 100 \
        +channel -background none -gravity center -extent 432x432 \
        -strip "$IMAGES/android-icon-monochrome.png"

# --- 7. iOS Icon Composer layer ------------------------------------------
# One 1024² layer, same framing as icon.png, composited by iOS over the navy
# `fill` in `assets/expo.icon/icon.json`.
convert -size 1024x1024 xc:none \
        \( "$WORK/cutout.png" -resize 860x \) -gravity center -composite \
        -strip "$ICON_ASSETS/sbs-logo.png"

# --- 8. Report -----------------------------------------------------------
echo "wrote:"
for f in "$IMAGES/icon.png" "$IMAGES/splash-icon.png" "$IMAGES/favicon.png" \
         "$IMAGES/android-icon-foreground.png" "$IMAGES/android-icon-background.png" \
         "$IMAGES/android-icon-monochrome.png" "$BRAND/sbs-logo-mark.png" \
         "$BRAND/sbs-logo-lockup.png" "$ICON_ASSETS/sbs-logo.png"; do
  printf '  %-48s %-10s %s\n' "${f#assets/}" "$(identify -format '%wx%h' "$f")" \
         "$(du -h "$f" | cut -f1)"
done
