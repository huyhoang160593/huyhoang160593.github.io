#!/usr/bin/env node
// The episode guard: one Episode number, one Post. It reads Post frontmatter
// directly — no build, browser or network — so a reused seat is caught before
// anything ships, and `nub run verify` applies the same gate locally and in CI.
//
// Presence of `episode` on a published Post is the schema's job
// (src/content.config.ts, per-entry refine). This checks the only thing no
// single entry can prove on its own: that no two entries — draft or
// published — carry the same number. Gaps are allowed; nothing here checks
// contiguity or date order (spec #12, Implementation Decisions).
//
// Run it through `nub run verify`. Same shape as tools/check-design.mjs.
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const rel = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(rel(p), "utf8");

const BLOG_DIR = "src/content/blog";

function filesUnder(dir, match, found = []) {
  for (const entry of fs.readdirSync(rel(dir), { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) filesUnder(child, match, found);
    else if (match(child)) found.push(child);
  }
  return found;
}

/** The frontmatter of a Post: the YAML block between its `---` fences. */
function frontmatter(file) {
  const block = read(file).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block)
    throw new Error(`${file} has no frontmatter block — every Post needs one`);
  return parse(block[1]) ?? {};
}

// ---------------------------------------------------------------------------
// checks. Each returns a line of evidence, or throws with what is wrong.

const CHECKS = [
  {
    id: "episodes are never reused",
    what: "no two Posts declare the same episode number",
    run() {
      const posts = filesUnder(BLOG_DIR, (f) => /\.(md|mdx)$/.test(f));
      const byEpisode = new Map();
      for (const file of posts) {
        const episode = frontmatter(file).episode;
        if (episode === undefined || episode === null) continue;
        if (!byEpisode.has(episode)) byEpisode.set(episode, []);
        byEpisode.get(episode).push(file);
      }
      const reused = [...byEpisode].filter(
        ([, claimants]) => claimants.length > 1,
      );
      if (reused.length) {
        const detail = reused
          .map(
            ([episode, claimants]) =>
              `episode ${episode} is claimed by ${claimants.length} Posts: ${claimants.join(", ")}`,
          )
          .join("\n  ");
        throw new Error(
          `${detail}\n` +
            `  Episodes count up from the first Post and are never reused —` +
            ` give each Post its own number (drafts may leave it unset).`,
        );
      }
      return `${byEpisode.size} episode(s) declared across ${posts.length} Posts, each used once`;
    },
  },
];

// ---------------------------------------------------------------------------

let failed = 0;
for (const check of CHECKS) {
  try {
    const evidence = check.run();
    console.log(`  ok    ${check.id} — ${evidence}`);
  } catch (error) {
    failed++;
    console.log(
      `  FAIL  ${check.id} — ${check.what}\n        ${error.message.split("\n").join("\n        ")}`,
    );
  }
}
console.log(
  failed
    ? `\n${failed} of ${CHECKS.length} episode checks failed.`
    : `\nall ${CHECKS.length} episode checks passed.`,
);
process.exit(failed ? 1 : 0);
