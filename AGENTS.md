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

This repo commits **`pnpm-lock.yaml`** — the format nub writes while `package.json#packageManager` names pnpm. CI installs with `nub ci` through `nubjs/setup-nub`, not `withastro/action`; see `docs/adr/0001-deploy-with-nub-and-pnpm-lockfile.md`.

### Preview and browser tools

This checkout runs inside **proot on Android** — an Ubuntu rootfs on a phone, not a normal desktop. Confirm with `env | grep -E '^PROOT'` (`PROOT` and `PROOT_LOADER` set) and an `android*` kernel from `uname -r`.

There, the in-app browser tools do **not** work — do not reach for them:

- `browser.snapshot` / `click` / `type` / `capture` fail with "No OpenChamber client connected here can control a page": the mobile client can display a page but cannot drive one.
- `browser.open` only times out (45s). Retry it at most once.

So for a preview, just run the dev server as usual and hand over the link — verify with `curl`, never with a browser tool:

```bash
nub run dev
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/
```

Then send the user `http://localhost:4321` and let them open it in their own browser and drive it themselves.

Trap: that server listens on loopback **IPv6 only**, while a phone browser resolves `localhost` to `127.0.0.1` and gets connection refused. A `--host` passed through `nub run` does not take effect; run the binary directly to bind IPv4, and take the `Network:` addresses it prints as the alternative link when the user's browser is not on this machine:

```bash
node_modules/.bin/astro dev --host 0.0.0.0 --port 4321
```

To *show* something visual inline, use the HTML page render tool — it renders into the chat and needs no browser. To let the user *interact*, hand over a link.

Use the browser tools only where a suitable MCP server provides a working equivalent.
