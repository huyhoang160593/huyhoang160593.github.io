# Lint with ESLint and format with Prettier

`.astro` files are linted by `eslint-plugin-astro` on ESLint 10 and typescript-eslint, and formatted by the officially maintained `prettier-plugin-astro`. Biome is the tempting one-binary alternative, but its `.astro` support is opt-in and still experimental, with open issues where formatting strips frontmatter or template content; oxlint, the other fast candidate, reads only the frontmatter and `<script>` blocks of an `.astro` file and never the template. Only the ESLint plugin covers the whole file.

## Considered options

- **Biome** — fastest single tool, but `.astro` needs `html.experimentalFullSupportEnabled` and carries known formatting bugs. Rejected as the only tool; still viable later for plain TypeScript.
- **oxlint** — very fast, partial `.astro` support by design. Rejected for the same reason.
- **Prettier + `eslint-plugin-astro`** — chosen. Neither is fast, and there are two tools to keep updated.

## Consequences

- `nub run build` runs `astro check` for types before `astro build`, so a type error fails the deploy.
- `eslint-config-prettier` is last in `eslint.config.js`, which keeps the linter out of formatting's way.
