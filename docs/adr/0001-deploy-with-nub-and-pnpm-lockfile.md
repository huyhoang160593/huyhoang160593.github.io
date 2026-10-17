# Deploy with nub, keeping the lockfile in pnpm format

`.github/workflows/deploy.yml` installs the project with `nub ci` and builds with `nub run build` instead of using `withastro/action`. The official action picks a package manager from the lockfile and only knows npm, yarn, pnpm, bun and deno, so it cannot drive a project whose package manager is nub. The lockfile is committed as `pnpm-lock.yaml` because that is the format nub writes when `packageManager` names pnpm — which keeps it readable by ordinary tooling (Renovate, Dependabot, a human with pnpm) instead of a nub-only file.

## Considered options

- **`nub.lock`** — nub's native lockfile when no incumbent package manager is declared. Works with `nub ci`, but nothing else can read it and `packageManager` would stay unset.
- **`package-lock.json`** — readable everywhere, but it would describe an npm-style layout that nobody actually installs.
- **`withastro/action` with `package-manager: pnpm`** — installs with pnpm rather than the tool the project uses, so the CI install would differ from the local one.

## Consequences

- The workflow needs the explicit `checkout` → `setup-nub` → `nub ci` → `nub run build` → `upload-pages-artifact` → `deploy-pages` chain.
- `package.json#packageManager` exists to select the lockfile format; pnpm is not the package manager anyone runs.
