## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map to label strings of the same name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: root `GLOSSARY.md` plus `docs/adr/`. See `docs/agents/domain.md`.

### Checks

`nub run verify` is the repo's check command: `eslint`, then `astro check` and the
build. CI runs it on every pull request and on `main`
(`.github/workflows/verify.yml`); `Deploy to GitHub Pages` is a separate workflow
that runs only on `main` and does **not** lint.

A new guard belongs in `verify`, not in the workflow, so it runs everywhere the
others do. A guard that needs something CI cannot have — downloaded source
figures, a browser, a person's eyes — stays local and documents itself.

`tools/` holds the guards and the one-off tooling: `tools/check-design.mjs` is in
`verify`, and `tools/palette/` is the measurement the theme colours came from —
its README says how to re-measure them, and `tools/palette/check-brief.mjs` is the
half that needs the source figures and so stays out of `verify`.

### Package manager / runtime

Use **`nub`** (v0.9.6, all-in-one Node.js toolkit, installed via `mise`) as the package manager and runtime: `nub install` (reuses the existing lockfile), `nub ci` (clean, frozen), `nub run <script>`, `nub add`, `nubx <bin>` — `nub --help` covers the rest.

In a worktree, reuse an existing install by symlinking `node_modules` at the checkout root instead of running `nub ci` again; a full install is minutes on this phone, and `node_modules` is gitignored in both forms.

Lockfile: nub reuses the project's existing lockfile; it does **not** create a `nub`-specific lockfile. Keep the committed lockfile in sync with `package.json`.

This repo commits **`pnpm-lock.yaml`** — the format nub writes while `package.json#packageManager` names pnpm. CI installs with `nub ci` through `nubjs/setup-nub`, not `withastro/action`; see `docs/adr/0001-deploy-with-nub-and-pnpm-lockfile.md`.

### Preview and browser tools

This checkout runs inside **proot on Android** — an Ubuntu rootfs on a phone, not a normal desktop. Confirm with `env | grep -E '^PROOT'` (`PROOT` and `PROOT_LOADER` set) and an `android*` kernel from `uname -r`.

There, the in-app browser tools do **not** work — do not reach for them:

- `browser.snapshot` / `click` / `type` / `capture` fail with "No OpenChamber client connected here can control a page": the mobile client can display a page but cannot drive one.
- `browser.open` only times out (45s). Retry it at most once.

So for a preview, start the dev server and hand over the link — verify with `curl`, never with a browser tool. The server runs **in the background** and outlives the shell command that started it:

```bash
node_modules/.bin/astro dev status   # what is up, and on which port
node_modules/.bin/astro dev logs     # the server's own output
node_modules/.bin/astro dev stop     # when you are done with it
```

**Read the port off what the server printed.** When another checkout already holds the port you asked for, astro silently takes the next free one, and several worktrees can have servers up at once — so `http://localhost:4321` may be somebody else's checkout serving an older branch. Before handing a link over, fetch it and read back what it actually serves:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4322/
curl -s http://localhost:4322/ | grep -o '<html[^>]*>'
```

Then send the user the address the server printed and let them open it in their own browser and drive it themselves.

Trap: that server listens on loopback **IPv6 only**, while a phone browser resolves `localhost` to `127.0.0.1` and gets connection refused. A `--host` passed through `nub run` does not take effect; run the binary directly to bind IPv4, and take the `Network:` addresses it prints as the alternative link when the user's browser is not on this machine:

```bash
node_modules/.bin/astro dev --host 0.0.0.0 --port 4321
```

To _show_ something visual inline, use the HTML page render tool — it renders into the chat and needs no browser. To let the user _interact_, hand over a link.

Use the browser tools only where a suitable MCP server provides a working equivalent.
