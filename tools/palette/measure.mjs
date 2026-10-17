#!/usr/bin/env node
// Measure the palette of a source figure, dark to light, with the settings the
// recorded palettes were measured with (see lib.mjs and README.md).
//
//   node tools/palette/measure.mjs arcade
//   node tools/palette/measure.mjs cat-cafe-summer --region TL --stride 3
//   node tools/palette/measure.mjs arcade --k 10 --merge 14   # the coarse pass,
//                                                             # for comparison
//
// Figures are read from .cache/palette unless PALETTE_IMAGES says otherwise.
import { measureFigure, REGION_NAMES, SETTINGS, parseArgs } from "./lib.mjs";

const { positional, options } = parseArgs(process.argv.slice(2), {
  flags: ["all-regions"],
});
if (!positional.length) {
  console.error(
    "usage: measure.mjs <figure> [more…] [--region TL|TR|BL|BR] [--k 12] [--merge 8]",
  );
  console.error(
    "       measure.mjs <figure> --stride 3        (every third pixel, as §5.2 used)",
  );
  console.error(
    "       measure.mjs <figure> --all-regions     (a 2x2 sheet of one scene)",
  );
  console.error(`\nregions: ${REGION_NAMES.join(", ")}`);
  process.exit(2);
}

const settings = {};
if (options.k) settings.k = Number(options.k);
if (options.merge) settings.mergeAt = Number(options.merge);
if (options.stride) settings.stride = Number(options.stride);

const wanted = positional.flatMap((name) =>
  options["all-regions"]
    ? ["TL", "TR", "BL", "BR"].map((region) => ({ name, region }))
    : [{ name, region: options.region ?? "all" }],
);
for (const { name, region } of wanted) {
  const figure = measureFigure(name, { ...settings, region });
  const width = Math.max(...figure.clusters.map((c) => c.hex.length)) + 1;
  const grid = settings.stride
    ? `stride=${figure.step}`
    : `≈${SETTINGS.samples} samples`;
  console.log(
    `== ${name}  [${region}]  ${figure.pixels} px (${grid})  k=${settings.k ?? SETTINGS.k} merge=${settings.mergeAt ?? SETTINGS.mergeAt}`,
  );
  for (const c of figure.clusters) {
    console.log(
      `   ${c.hex.padEnd(width)} ${(c.weight * 100).toFixed(1).padStart(5)}%  sat ${c.saturation.toFixed(2)}`,
    );
  }
}
