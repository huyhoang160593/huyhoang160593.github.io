import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist/", ".astro/", "node_modules/"] },
  // typescript-eslint first, then astro: the astro config owns the parser for
  // `.astro` files, and the later config wins.
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
];
