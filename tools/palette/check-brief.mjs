#!/usr/bin/env node
// Provenance check for the recorded palettes.
//
// Every colour in section 5 of the brief must be reproducible from the source
// figures that section names, measured with the recorded settings. Run this
// after editing §5, a theme, or this folder.
//
// It needs the figures downloaded (see README.md) and is therefore **not** part
// of `nub run verify`: `tools/check-design.mjs` is the part that runs in CI,
// against the source tree alone. This one answers the other half — that the
// numbers in §5 really came off the paintings they claim to.
import { SETTINGS, measureFigure } from "./lib.mjs";
import { recordedPalette } from "../brief.mjs";

// The figures §5 measures, the region each palette came from, and the sampling
// its values reproduce under — §5.1 records both grids, because the light
// palette does not come out the same at the default spacing. Written out here
// rather than parsed from the prose, so the check does not depend on how §5 is
// worded — only on the settings it claims.
const SOURCES = [
  {
    image: "arcade",
    region: "all",
    label: "arcade background — the dark palette (game-center)",
  },
  {
    image: "cat-cafe-summer",
    region: "TL",
    stride: 3,
    label: "cat café, summer panel only — the light palette (cat-cafe)",
  },
];

const recorded = [...recordedPalette()];

const measured = new Map(); // hex -> the figures it was measured from
for (const source of SOURCES) {
  const figure = measureFigure(source.image, {
    region: source.region,
    stride: source.stride,
  });
  const grid = source.stride
    ? `every ${figure.step} px`
    : `≈${SETTINGS.samples} samples`;
  console.log(
    `\n${source.label}\n  ${source.image} [${source.region}], ${figure.pixels} px (${grid}), k=${SETTINGS.k} merge=${SETTINGS.mergeAt}`,
  );
  for (const c of figure.clusters) {
    console.log(
      `  ${c.hex}  ${(c.weight * 100).toFixed(1).padStart(5)}%  sat ${c.saturation.toFixed(2)}`,
    );
    measured.set(c.hex, [...(measured.get(c.hex) ?? []), source.image]);
  }
}

console.log(
  `\nsection 5 records ${recorded.length} colours; the figures measure ${measured.size}`,
);
for (const hex of recorded) {
  const provenance = measured.get(hex);
  console.log(
    `  ${hex}  ${provenance ? provenance.join(", ") : "NOT MEASURED"}`,
  );
}

const unmeasured = recorded.filter((h) => !measured.has(h));
if (unmeasured.length) {
  console.log("\nFAIL — recorded but not measured from any figure in SOURCES:");
  for (const hex of unmeasured) console.log(`  ${hex}`);
  console.log(
    "\nEither the colour was invented, or a figure/region is missing from SOURCES.",
  );
  process.exit(1);
}
console.log("\nPASS — every recorded colour is measured from a named figure.");
