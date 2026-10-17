// Shared decoding, sampling and k-means for the palette tools in this folder.
//
// These settings are the recorded method, and they are the point of the tool.
// k = 12 with a merge distance of 8 keeps small saturated minority accents —
// the cat café's red roof, the near-white clouds — that a coarser merge
// swallows into their nearest neighbour. Re-measuring with more forgiving
// settings is how the first, rejected pass produced a palette with no accents
// in it while still looking plausible. See docs/research/bee-and-puppycat.md §5.
import fs from "node:fs";
import path from "node:path";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

export const SETTINGS = {
  /** clusters asked for */
  k: 12,
  /** clusters closer than this (in RGB distance) are merged */
  mergeAt: 8,
  /**
   * The grid the dark palette reproduces under: about this many samples,
   * whatever the figure's size. The light palette needs the denser `stride`
   * instead — see README.md and the brief's §5.1 — and each figure's setting is
   * recorded beside the palette it produced, so a re-measure can be exact.
   */
  samples: 30000,
  /** When set, sample every nth pixel on both axes instead of the `samples` grid. */
  stride: null,
  /** k-means iterations */
  iterations: 20,
  /** fixed PRNG seed, so a re-measure is byte-identical */
  seed: 11,
  /** clusters lighter than this share of the figure are dropped as noise */
  minWeight: 0.004,
};

import { REPO_ROOT } from "../brief.mjs";

export { REPO_ROOT };

/** Where the downloaded source figures live. Never committed; see README.md. */
export function imagesDir() {
  return (
    process.env.PALETTE_IMAGES ?? path.join(REPO_ROOT, ".cache", "palette")
  );
}

/** Resolve a figure by filename, or by name with its extension left off. */
export function findImage(name) {
  const dir = imagesDir();
  if (!fs.existsSync(dir)) {
    throw new Error(
      `no image directory at ${dir} — download the figures listed in tools/palette/README.md`,
    );
  }
  const files = fs.readdirSync(dir);
  const file =
    files.find((f) => f === name) ??
    files.find((f) => f.replace(/\.(jpe?g|png)$/i, "") === name);
  if (!file)
    throw new Error(
      `no figure named "${name}" in ${dir}\n  have: ${files.join(", ")}`,
    );
  return path.join(dir, file);
}

export function decode(file) {
  const buf = fs.readFileSync(file);
  const isPng = buf
    .subarray(0, 8)
    .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (isPng) {
    const p = PNG.sync.read(buf);
    return { width: p.width, height: p.height, data: p.data };
  }
  const j = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 2048 });
  return { width: j.width, height: j.height, data: j.data };
}

const REGIONS = {
  all: [0, 0, 1, 1],
  TL: [0, 0, 0.5, 0.5],
  TR: [0.5, 0, 0.5, 0.5],
  BL: [0, 0.5, 0.5, 0.5],
  BR: [0.5, 0.5, 0.5, 0.5],
};

export const REGION_NAMES = Object.keys(REGIONS);

/**
 * Sample a figure, optionally inside one named region (fractions of the figure).
 * Either `stride` — every nth pixel on both axes — or, by default, a grid of
 * about `samples` pixels whatever the figure's size. The step actually used is
 * returned with the pixels, because it is part of the result: the light palette
 * does not reproduce at the default spacing.
 */
export function sample(
  img,
  { region = "all", samples = SETTINGS.samples, stride } = {},
) {
  const r = REGIONS[region];
  if (!r)
    throw new Error(
      `unknown region "${region}" — try ${REGION_NAMES.join(", ")}`,
    );
  const [fx, fy, fw, fh] = r;
  const x0 = Math.floor(img.width * fx);
  const y0 = Math.floor(img.height * fy);
  const w = Math.floor(img.width * fw);
  const h = Math.floor(img.height * fh);
  const step = stride ?? Math.max(1, Math.floor(Math.sqrt((w * h) / samples)));
  const pixels = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const s = ((y0 + y) * img.width + (x0 + x)) * 4;
      pixels.push([img.data[s], img.data[s + 1], img.data[s + 2]]);
    }
  }
  return { pixels, step };
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
export const sat = (c) =>
  (Math.max(...c) - Math.min(...c)) / Math.max(1, Math.max(...c));

/** `#rrggbb`, rounding each channel. */
export const hex = (c) =>
  "#" +
  c
    .map((v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

/**
 * k-means over sampled pixels, merged and sorted dark to light.
 * Returns `[{ hex, weight, saturation }]`, heaviest first inside each merge.
 */
export function kmeans(px, settings = {}) {
  const { k, mergeAt, iterations, seed, minWeight } = {
    ...SETTINGS,
    ...settings,
  };
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const C = Array.from({ length: k }, () =>
    px[Math.floor(rnd() * px.length)].slice(),
  );
  const A = new Array(px.length).fill(0);
  for (let it = 0; it < iterations; it++) {
    const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (let i = 0; i < px.length; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist(px[i], C[c]);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      A[i] = best;
      const acc = sums[best];
      acc[0] += px[i][0];
      acc[1] += px[i][1];
      acc[2] += px[i][2];
      acc[3]++;
    }
    for (let c = 0; c < k; c++) {
      if (sums[c][3]) {
        C[c] = [
          sums[c][0] / sums[c][3],
          sums[c][1] / sums[c][3],
          sums[c][2] / sums[c][3],
        ];
      }
    }
  }
  const n = new Array(k).fill(0);
  for (const a of A) n[a]++;
  const clusters = C.map((c, i) => ({ c, w: n[i] / px.length })).filter(
    (x) => x.w > minWeight,
  );
  clusters.sort((a, b) => b.w - a.w);
  const merged = [];
  for (const x of clusters) {
    const near = merged.find((y) => dist(y.c, x.c) < mergeAt);
    if (near) near.w += x.w;
    else merged.push({ c: x.c.slice(), w: x.w });
  }
  return merged
    .sort((a, b) => lum(a.c) - lum(b.c))
    .map(({ c, w }) => ({ hex: hex(c), weight: w, saturation: sat(c) }));
}

/** One figure (or one region of it) measured, in reading order. */
export function measureFigure(name, options = {}) {
  const img = decode(findImage(name));
  const { pixels, step } = sample(img, options);
  return {
    name,
    region: options.region ?? "all",
    step,
    pixels: pixels.length,
    clusters: kmeans(pixels, options),
  };
}

/** `--flag value` and `--flag` (boolean) parsing for the CLIs. */
export function parseArgs(argv, { flags = [] } = {}) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    options[key] = flags.includes(key) ? true : argv[++i];
  }
  return { positional, options };
}
