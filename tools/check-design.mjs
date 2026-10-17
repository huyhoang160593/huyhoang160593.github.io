#!/usr/bin/env node
// The design guard: the invariants the theme work rests on, checked against the
// source tree and the build. No images and no network, so CI can run it.
//
// Each of these was enforced by hand, once, in a throwaway script, and a
// constraint nothing checks is a constraint that erodes. `tools/palette/check-brief.mjs`
// is the other half of the chain: it re-measures the source paintings and fails
// if §5 of the brief records a colour no figure produces.
//
// Run it through `nub run verify`, which builds first — the last check reads `dist/`.
import fs from "node:fs";
import path from "node:path";
// The recorded palettes, so "§5 records" means the same thing to this check and
// to tools/palette/check-brief.mjs, which re-measures them.
import { hexesIn, recordedPalette } from "./brief.mjs";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const rel = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(rel(p), "utf8");

const CSS_PATH = "src/styles/global.css";
const BRIEF = "docs/research/bee-and-puppycat.md";

// ---------------------------------------------------------------------------
// helpers

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Every `@plugin "daisyui/theme"` block: its name and its custom properties. */
function themeBlocks(css) {
  const blocks = [];
  for (const m of css.matchAll(
    /@plugin\s+["']daisyui\/theme["']\s*\{([\s\S]*?)\n\}/g,
  )) {
    const name = m[1].match(/name:\s*["']([^"']+)["']/)?.[1];
    const vars = {};
    for (const v of m[1].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g))
      vars[v[1]] = v[2].trim();
    if (name) blocks.push({ name, vars });
  }
  return blocks;
}

const rgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

const linear = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (c) =>
  0.2126 * linear(c.r) + 0.7152 * linear(c.g) + 0.0722 * linear(c.b);

/** WCAG contrast ratio between two `#rrggbb` strings. */
function contrast(a, b) {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function filesUnder(dir, match, found = []) {
  for (const entry of fs.readdirSync(rel(dir), { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) filesUnder(child, match, found);
    else if (match(child)) found.push(child);
  }
  return found;
}

// ---------------------------------------------------------------------------
// checks. Each returns a line of evidence, or throws with what is wrong.

const CHECKS = [
  {
    id: "palette is measured",
    what: `${CSS_PATH} uses only colours the brief records`,
    run() {
      const recorded = recordedPalette();
      const used = hexesIn(stripComments(read(CSS_PATH)));
      const invented = used.filter((h) => !recorded.has(h));
      if (invented.length) {
        throw new Error(
          `not recorded in ${BRIEF} §5: ${invented.join(" ")}\n` +
            `  Either measure it (tools/palette/README.md) or use a recorded colour.`,
        );
      }
      return `${used.length} colours used, all ${recorded.size} of §5's on file`;
    },
  },

  {
    id: "body text is readable",
    what: "base-content clears 4.5:1 on every base step, each -content pair 3:1",
    run() {
      const themes = themeBlocks(read(CSS_PATH));
      if (themes.length < 2)
        throw new Error(
          `expected two daisyUI theme blocks, found ${themes.length}`,
        );
      const lines = [];
      for (const { name, vars } of themes) {
        const ink = vars["color-base-content"];
        for (const step of ["100", "200", "300"]) {
          const surface = vars[`color-base-${step}`];
          if (!surface) throw new Error(`${name} has no --color-base-${step}`);
          const ratio = contrast(ink, surface);
          // The criterion in tickets #5 and #6 is 4.5:1 for body text.
          if (ratio < 4.5) {
            throw new Error(
              `${name}: base-content on base-${step} is ${ratio.toFixed(2)}:1, under 4.5:1\n` +
                `  Reorder the measured values rather than inventing a colour.`,
            );
          }
        }
        // Saturated fills cannot reach 4.5:1 from eight measured colours; the
        // floor there is AA large text, and the stylesheet keeps body-size text
        // off those fills. Assert the floor so it cannot drift lower unseen.
        const worst = [];
        for (const [key, fill] of Object.entries(vars)) {
          const content = vars[`${key}-content`];
          if (
            !key.startsWith("color-") ||
            !content ||
            !/^#[0-9a-f]{6}$/.test(fill)
          )
            continue;
          if (key.startsWith("color-base")) continue;
          const ratio = contrast(fill, content);
          worst.push([`${key.replace("color-", "")}`, ratio]);
          if (ratio < 3) {
            throw new Error(
              `${name}: ${key} with its -content is ${ratio.toFixed(2)}:1, under 3:1 (AA large)`,
            );
          }
        }
        worst.sort((a, b) => a[1] - b[1]);
        lines.push(
          `${name}: base steps ≥${Math.min(
            ...["100", "200", "300"].map((s) =>
              contrast(ink, vars[`color-base-${s}`]),
            ),
          ).toFixed(
            2,
          )}:1, closest fill ${worst[0][0]} ${worst[0][1].toFixed(2)}:1`,
        );
      }
      return lines.join("; ");
    },
  },

  {
    id: "one source of truth for theme names",
    what: "each theme name appears in exactly one file under src/",
    run() {
      const names = themeBlocks(read(CSS_PATH)).map((t) => t.name);
      const sources = filesUnder("src", (f) => /\.(ts|astro|js|mjs)$/.test(f));
      const report = [];
      for (const name of names) {
        const owners = sources.filter((f) => read(f).includes(name));
        if (owners.length !== 1) {
          throw new Error(
            `"${name}" appears in ${owners.length} files under src/: ${owners.join(", ")}\n` +
              `  The root element, the pre-paint script and the toggle must read one module.`,
          );
        }
        report.push(`${name} in ${owners[0]}`);
      }
      return report.join(", ");
    },
  },

  {
    id: "retired theme names are gone",
    what: "no retro or synthwave outside the stylesheet's own history",
    run() {
      const files = [
        ...filesUnder("src", () => true),
        "README.md",
        "GLOSSARY.md",
      ];
      const stale = [];
      for (const file of files) {
        if (/\b(retro|synthwave)\b/i.test(read(file))) stale.push(file);
      }
      if (stale.length) {
        throw new Error(`still named the old themes: ${stale.join(", ")}`);
      }
      return `${files.length} files clean`;
    },
  },

  {
    id: "fonts are self-hosted and subsetted",
    what: "every @font-face carries unicode-range, and nothing loads a third party font",
    run() {
      const css = stripComments(read(CSS_PATH));
      const faces = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\n\}/g)].map(
        (m) => m[1],
      );
      if (!faces.length) throw new Error(`no @font-face in ${CSS_PATH}`);
      for (const face of faces) {
        const family = face.match(/font-family:\s*["']?([^"';]+)/)?.[1] ?? "?";
        if (!/unicode-range:/.test(face)) {
          throw new Error(
            `${family} declares no unicode-range: importing two subsets for one weight\n` +
              `  silently collapses to one, and the Vietnamese subset is the default locale's.`,
          );
        }
        if (!/font-display:\s*swap/.test(face))
          throw new Error(`${family} is not font-display: swap`);
      }
      const thirdParty = filesUnder("src", () => true).filter((f) =>
        /fonts\.(googleapis|gstatic)\.com/.test(read(f)),
      );
      if (thirdParty.length)
        throw new Error(`third-party font request in ${thirdParty.join(", ")}`);
      const families = new Set(
        faces.map(
          (f) => f.match(/font-family:\s*["']?([^"';]+)/)?.[1].trim() ?? "?",
        ),
      );
      return `${faces.length} faces, ${families.size} families: ${[...families].join(", ")}`;
    },
  },

  {
    id: "the focus ring can win",
    what: "no :where() focus rule, and an ink ring exists",
    run() {
      const css = stripComments(read(CSS_PATH));
      const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
        selector: m[1].trim(),
        body: m[2],
      }));
      const focusRules = rules.filter(
        (r) => r.selector.includes(":focus-visible") && /outline/.test(r.body),
      );
      if (!focusRules.length)
        throw new Error("no :focus-visible rule sets an outline");
      // `:where()` contributes zero specificity, so such a rule cannot win the
      // cascade against daisyUI's own focus rule — it is dead code that reads
      // as a focus ring. Raise it with :is() or a class instead.
      const dead = focusRules.filter((r) => r.selector.includes(":where("));
      if (dead.length) {
        throw new Error(
          `a :where() selector gives zero specificity, so this can never apply:\n  ${dead[0].selector}`,
        );
      }
      if (!focusRules.some((r) => /outline:[^;]*var\(--ink\)/.test(r.body))) {
        throw new Error("no focus rule draws the ring in var(--ink)");
      }
      return `${focusRules.length} focus rules, all able to win`;
    },
  },

  {
    id: "shadows stay hard",
    what: "no blurred or translucent shadow in the stylesheet",
    run() {
      const css = stripComments(read(CSS_PATH));
      const soft = [...css.matchAll(/box-shadow:[^;]*/g)].filter((m) =>
        /blur\(|rgba?\(/.test(m[0]),
      );
      if (soft.length)
        throw new Error(`a soft shadow crept in:\n  ${soft[0][0]}`);
      const hard = [...css.matchAll(/box-shadow:[^;]*var\(--ink\)/g)].length;
      if (!hard) throw new Error("no hard ink-offset shadow found");
      return `${hard} hard ink shadows, 0 blurred`;
    },
  },

  {
    id: "motion is opt-out",
    what: "transitions and animations sit behind a reduced-motion query",
    run() {
      const css = stripComments(read(CSS_PATH));
      if (!/@media[^{]*prefers-reduced-motion/.test(css)) {
        throw new Error(
          "no prefers-reduced-motion guard: the states would animate for everyone",
        );
      }
      return "guarded";
    },
  },

  {
    id: "the build carries the design",
    what: "one title card per page, both themes, both font families, motion bounded",
    run() {
      if (!fs.existsSync(rel("dist"))) {
        throw new Error(
          "dist/ is missing — run `nub run build` first (verify does)",
        );
      }
      const pages = filesUnder("dist", (f) => f.endsWith(".html"));
      if (!pages.length) throw new Error("dist/ has no pages");
      const animated = [];
      for (const page of pages) {
        const html = read(page);
        const cards = html.split("data-title-card").length - 1;
        if (cards !== 1) {
          throw new Error(
            `${page} has ${cards} title cards, expected exactly 1`,
          );
        }
        animated.push([page, html.split("animate-in").length - 1]);
      }
      // The criterion is "no more than about ten elements animate at once".
      const busiest = animated.sort((a, b) => b[1] - a[1])[0];
      if (busiest[1] > 10)
        throw new Error(
          `${busiest[0]} animates ${busiest[1]} elements at once`,
        );

      const css = filesUnder("dist/_astro", (f) => f.endsWith(".css"))
        .map(read)
        .join("");
      const themes = themeBlocks(read(CSS_PATH)).map((t) => t.name);
      for (const name of themes) {
        if (!css.includes(`[data-theme=${name}]`))
          throw new Error(`the build has no [data-theme=${name}]`);
      }
      const fonts = filesUnder("dist", (f) => f.endsWith(".woff2")).map((f) =>
        path.basename(f),
      );
      for (const family of ["baloo-2", "nunito-sans"]) {
        if (!fonts.some((f) => f.includes(family)))
          throw new Error(`no ${family} woff2 emitted`);
      }
      return `${pages.length} pages ×1 card, ${themes.length} themes, ${fonts.length} woff2, busiest page animates ${busiest[1]}`;
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
    ? `\n${failed} of ${CHECKS.length} design checks failed.`
    : `\nall ${CHECKS.length} design checks passed.`,
);
process.exit(failed ? 1 : 0);
