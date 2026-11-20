# Pitch Black Swiss background and cursor

Portions of the hero background and custom cursor are adapted from
[Portfolio-Pitch-Black-Swiss](https://github.com/dev-sufyaan/Portfolio-Pitch-Black-Swiss),
Copyright (c) 2025 Sufyaan (dev-sufyaan), under the MIT license.
The complete upstream notice is retained in [licenses/pitch-black-swiss-MIT.txt](licenses/pitch-black-swiss-MIT.txt).

Original source files:

- `components/sections/hero-section.tsx`: `NoiseGridBackground` and the surrounding gradient/vignette layers.
- `app/globals.css`: `.hero-grid-pattern`, grid pulse/intersection/noise keyframes, and film-grain styles.
- `components/noise-overlay.tsx`: SVG turbulence overlay.
- `components/custom-cursor.tsx`: 0.15 position interpolation, 12px/48px white difference cursor, 10ms hover detection, and 200ms dimension/margin transitions.
- `app/layout.tsx`: root-level cursor and fixed global grain mounting.

The grid, grain, depth gradients, and vignette are mounted once
inside `HeroBackground`, absolutely positioned within the hero. A mask on the
entire background stack combines a broad elliptical edge fade with the existing
smooth vertical fade over the final 60% of the hero, reaching complete
transparency over a solid black base. Decorative corner brackets are removed.
My Work, About, and Contact have solid black backgrounds without grid or grain.
The existing grid and current `grain-shake` animation are preserved. No global
fixed background, blue spotlight, contact glow, or duplicate effects remain.
Only background layers and necessary positioning contexts were integrated;
existing content, spacing, typography, controls, and section layout are preserved.
The cursor uses a body portal to avoid clipping/blend isolation and restores the
native cursor for touch, reduced motion, keyboard navigation, and window exit.
Unused upstream imports/refs and the cursor effect's visibility-driven listener
re-registration were removed. No reference text, navigation, fonts, or projects
were imported.

The original referenced grain image, `https://assets.aceternity.com/noise.webp`,
is retained locally at `public/textures/pitch-black-swiss-noise.webp` without modification.
The rendered grain now uses `public/textures/seamless-grain.svg` to avoid bitmap
tile-edge artifacts. Its alpha mean and contrast match the original at the same
200px tile size; existing layer opacities and shake keyframes are unchanged.
The inline turbulence tiles also use explicit dimensions and filter bounds so
their stitched noise periods align with their tile edges.

## Adobe application icons

The SVG files in `public/icons/` identify the Adobe apps listed on the Info page.
The original artwork is by Adobe Inc. Wikimedia Commons lists these files as
public-domain artwork (PD-textlogo) and identifies the Adobe trademarks:

- [Adobe Premiere Pro](https://commons.wikimedia.org/wiki/File:Adobe_Premiere_Pro_CC_2026_icon.svg)
- [Adobe After Effects](https://commons.wikimedia.org/wiki/File:Adobe_After_Effects_CC_2026_icon.svg)
- [Adobe Photoshop](https://commons.wikimedia.org/wiki/File:Adobe_Photoshop_CC_2026_icon.svg)
- [Adobe Illustrator](https://commons.wikimedia.org/wiki/File:Adobe_Illustrator_CC_icon.svg)

The After Effects SVG was downloaded from the Adobe source linked on its
Commons page. The SVGs are used as supplied to identify the software, without
implying sponsorship or affiliation.
