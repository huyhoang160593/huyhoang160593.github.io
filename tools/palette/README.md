# Palette tools

The site's two themes are **measured colours**, not chosen ones. These scripts
are how they were measured, kept in the repo so the measurement can be repeated
and disputed instead of taken on faith.

The values themselves live in [`docs/research/bee-and-puppycat.md`](../../docs/research/bee-and-puppycat.md) §5, which is the
source of truth, with the decision recorded in [`docs/adr/0004-measured-palette-and-two-themes.md`](../../docs/adr/0004-measured-palette-and-two-themes.md).

## Method

k-means over the figure's pixels, with:

| setting        | value                            | why                                                                         |
| -------------- | -------------------------------- | --------------------------------------------------------------------------- |
| clusters       | `k = 12`                         | enough to hold a small saturated accent alongside the dominant ground       |
| merge distance | `8`                              | clusters closer than this in RGB merge; **raising it swallows the accents** |
| iterations     | `20`, seed `11`                  | a re-measure is byte-identical                                              |
| minimum weight | `0.4 %`                          | drops anti-aliasing fringes                                                 |
| grid           | `≈30 000` samples, or `stride 3` | recorded per palette; the two are not interchangeable                       |

The merge distance is the setting that matters most. An early attempt with a
coarse merge produced a tidy palette with **no accents in it** — the cat café's
red roof and the near-white clouds had been merged into their neighbours — while
still looking entirely plausible. Any result measured with a merge distance much
above 8 should be treated as a different, flatter palette, and says so in its own
output (`merge=`).

The sampling grid is the other load-bearing setting, and it is **not the same for
both palettes**. The dark palette reproduces on a grid of about 30 000 samples
whatever the figure's size; the light one reproduces on every third pixel of the
summer panel. At 30 000 samples that panel returns `#dcc69f` where the denser grid
returns the cream `#f8e2d5` and the straw `#e5da8e` as separate clusters, and
`#99cca8` in place of the sage `#adbfab`, with three more steps shifting a channel
or two. So each figure's grid is written beside the palette it produced, and
`check-brief.mjs` re-measures with exactly that grid and fails if a recorded colour
does not come back.

## Figures

Images are **downloaded, never committed** — only their URLs belong in the repo.
`PALETTE_IMAGES` overrides the location; the default, `.cache/palette/`, is
gitignored.

```bash
mkdir -p .cache/palette
curl -L -o .cache/palette/cat-cafe-summer \
  https://hanstseng.art/wp-content/uploads/2017/03/cat-cafe-2-summer-scaled.jpg
curl -L -o .cache/palette/arcade \
  https://hanstseng.art/wp-content/uploads/2016/11/bpcbgarcade.png
```

The names carry no extension on purpose: the decoder reads PNG or JPEG from the
file's own magic bytes, so what a figure is called is free, and the URL above is
what identifies it.

Both are first-party background paintings from art director Hans Tseng's own
portfolio. The light palette is measured from the **summer panel alone** — the
cat-café file is one scene drawn four times, one per season, and `--region TL`
takes the top-left (summer) quadrant. Averaging the four would produce a colour
no single frame of the show contains.

## Commands

```bash
node tools/palette/measure.mjs arcade                                    # §5.3
node tools/palette/measure.mjs cat-cafe-summer --region TL --stride 3    # §5.2
node tools/palette/measure.mjs cat-cafe-summer --all-regions             # four seasons
node tools/palette/check-brief.mjs                                       # is §5 still measured?
```

The first two commands are the ones §5 records, grid and all; the others are for
exploring.

`check-brief.mjs` re-measures both figures and fails if any colour **§5
records** is not reproducible from the figures it names. It needs the downloads
above, so it is not part of `nub run verify`; `tools/check-design.mjs` is the
other half of the same chain — it needs no images, runs in CI, and fails if the
stylesheet uses a colour §5 does not record.

## Dependencies

`jpeg-js` and `pngjs` are dev dependencies of the site (pure JS, no build step);
nothing in the site's own build imports them.
