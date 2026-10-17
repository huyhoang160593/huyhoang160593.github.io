## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map to label strings of the same name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: root `GLOSSARY.md` plus `docs/adr/`. See `docs/agents/domain.md`.

### Package manager / runtime

Use **`nub`** (v0.9.6, all-in-one Node.js toolkit, installed via `mise`) as the package manager and runtime.

- Install dependencies: `nub install` (reads the project's existing lockfile — `pnpm-lock.yaml` / `package-lock.json`, …)
- Clean CI install: `nub ci`
- Run a package.json script: `nub run <script>` (e.g. `nub run dev`, `nub run build`, `nub run lint`)
- Run a local binary: `nub exec <bin>` or `nubx <bin>`
- Add a dependency: `nub add <pkg>`
- Manage Node versions: `nub node <command>` (install / ls / uninstall / pin)

Lockfile: nub reuses the project's existing lockfile; it does **not** create a `nub`-specific lockfile. Keep the committed lockfile in sync with `package.json`.
