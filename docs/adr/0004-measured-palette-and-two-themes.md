# Ship two measured themes, `cat-cafe` and `game-center`

The site's two daisyUI themes are `cat-cafe` (light, the default) and `game-center` (dark),
replacing `retro` and `synthwave`. Both palettes are measured — k-means with `k = 12` and a
merge distance of 8 over first-party background paintings on art director Hans Tseng's own
portfolio — and every colour carries the image it came from; the method, the per-colour roles
and the source URLs live in `docs/research/bee-and-puppycat.md` §5, which is the source of
truth for the values.

- **`cat-cafe`** (light), from the summer panel (top-left) of
  <https://hanstseng.art/wp-content/uploads/2017/03/cat-cafe-2-summer-scaled.jpg>:
  `#f3fdfb` `#f8e2d5` `#e5da8e` `#9ce8ef` `#adbfab` `#3d88a0` `#ce797e` `#373853`.
- **`game-center`** (dark), from
  <https://hanstseng.art/wp-content/uploads/2016/11/bpcbgarcade.png>:
  `#d4fbf9` `#a1ecfd` `#4eb5fe` `#41f3c1` `#f0d293` `#c548ad` `#355fd9` `#353cae`.

The darkest measured colour in the dark palette is `#353cae`, a mid indigo rather than a
near-black, so `game-center` reads blue, not black; `cat-cafe` does carry a measured
near-white, `#f3fdfb`. Neither palette is padded toward a pure black or white.

Typography: **Baloo 2** for display and **Nunito Sans** for body, both self-hosted with the
Vietnamese and latin subsets and `font-display: swap`, because Vietnamese is the default
locale. **Space Mono is deferred** until a component actually needs monospace.

Contour, grain and depth: `--border: 2px` on both themes; `--noise: 1` on `cat-cafe` (paper
grain) and `0` on `game-center`; `--depth: 0` on both, because the drawn 2px contour supplies
its own hard offset shadow and daisyUI's soft 3D depth would fight it.

**Out of scope: the ornament budget.** A star field, a sparkle glyph and a scanline are
recorded as intent only — the show's "I put it everywhere" — and are deliberately not built
in this pass.

## Considered options

- **Reusing `retro`/`synthwave`** — both already lean pastel, but neither is measured, and
  naming the shipped themes after their source scenes keeps the palettes reviewable.
- **An invented palette derived from the section 4 traits** — the first draft of the brief.
  Measurement replaced it, because the show's own backgrounds are a stronger and checkable
  source than a guess.
- **Padding the dark ground toward `#000`** — rejected: the measured darkest colour is a mid
  indigo, and the resulting blue cast is the theme's point.
- **Shipping Space Mono now** — rejected for lack of a component that needs monospace.

## Consequences

- `docs/research/bee-and-puppycat.md` §5 is the source of truth for the palettes; the theme
  declarations in `src/styles/global.css` must match its measured hexes.
- The two theme names must come from one source of truth feeding the root element, the
  pre-paint allowlist and the toggle's value and handler, or the toggle silently drops a theme.
- No show artwork is redistributed: the brief and this ADR cite image URLs only, and no image
  file is committed.
