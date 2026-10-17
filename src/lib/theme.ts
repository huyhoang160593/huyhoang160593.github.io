/**
 * The site's two colour schemes, and the single source of truth for their
 * names. Everything that needs a theme name — the root element, the pre-paint
 * allowlist and the toggle's value and handler — imports from here, so the
 * four never drift apart.
 */
export const THEMES = ["cat-cafe", "game-center"] as const;

export type Theme = (typeof THEMES)[number];

/** Served as the root `data-theme`, and the fallback for an absent or
 * unrecognised saved choice. */
export const DEFAULT_THEME: Theme = "cat-cafe";

/** The theme a checked theme toggle selects. */
export const DARK_THEME: Theme = "game-center";

/** The theme a toggle in the given state should select. */
export function themeForToggle(checked: boolean): Theme {
  return checked ? DARK_THEME : DEFAULT_THEME;
}
