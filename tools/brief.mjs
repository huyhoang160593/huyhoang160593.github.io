// Reading the recorded palettes out of the research brief.
//
// Shared by tools/check-design.mjs, which compares the stylesheet against them
// and needs no images, and tools/palette/check-brief.mjs, which re-measures the
// source figures and does — so that both agree on what "§5 records" means.
import fs from "node:fs";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname);
export const REPO_ROOT = path.resolve(HERE, "..");
export const BRIEF_PATH = path.join(
  REPO_ROOT,
  "docs",
  "research",
  "bee-and-puppycat.md",
);

/** Every `#rrggbb` in a string, lower-cased and de-duplicated. */
export const hexesIn = (text) => [
  ...new Set(
    (text.match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((h) => h.toLowerCase()),
  ),
];

/** The brief's design-token section, §5. */
export function section5(brief = fs.readFileSync(BRIEF_PATH, "utf8")) {
  const start = brief.indexOf("## 5. ");
  const end = brief.indexOf("\n## Sources");
  if (start < 0 || end < 0)
    throw new Error(`could not find section 5 in ${BRIEF_PATH}`);
  return brief.slice(start, end);
}

/**
 * The colours §5 records, read from its palette tables: a row opening with a
 * `#rrggbb` in backticks, as in
 *
 *     | `#f3fdfb` | page ground | `base-100` | 4 — painted ground |
 *
 * §5's prose also cites values that are not part of a palette — the sparser
 * grid's output, a contrast pair discussed in §5.3 — which is why this does not
 * read every hex in the section.
 */
export function recordedPalette(text = section5()) {
  return new Set(
    [...text.matchAll(/^\|\s*`(#[0-9a-fA-F]{6})`/gm)].map((m) =>
      m[1].toLowerCase(),
    ),
  );
}
