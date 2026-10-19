# Personal Website

A bilingual personal site: a blog in Vietnamese and English. Static, built with Astro, deployed to GitHub Pages.

- Vietnamese is the default locale and lives at the root (`/`, `/blog/...`); English lives under `/en/...`.
- Package manager is **`nub`** with a committed `pnpm-lock.yaml` (see `docs/adr/0001`).
- Styling is Tailwind CSS 4 with daisyUI 5, themed `cat-cafe` (light, default) and `game-center` (dark).

## Commands

```bash
nub install       # install dependencies
nub run dev       # dev server on http://localhost:4321
nub run build     # astro check && astro build -> dist/
nub run preview   # preview the built site
nub run lint      # eslint
nub run format    # prettier --write
```

## Writing a post

Create `src/content/blog/<locale>/<slug>.mdx`:

```mdx
---
title: Tiêu đề
description: Một câu mô tả, dùng cho SEO và cho thẻ bài.
pubDate: 2026-10-17
episode: 12 # required on published Posts: a positive integer; drafts may omit it, and `verify` refuses the same number twice
translationKey: some-slug # optional: links this post to its counterpart
draft: false # optional: hides the post from a production build
tags: [meta] # optional
---

Nội dung.
```

The file name becomes the URL: `src/content/blog/<locale>/<slug>.mdx` is `/blog/<slug>` for `vi` (the default locale) and `/en/blog/<slug>` for `en`. Slugs may differ between locales; `translationKey` is what links a post to its translation, and it drives the language switcher.

Two conventions every Post follows — summarized here, with the full definitions in `GLOSSARY.md` and Register additionally in ADR 0005:

- **Register** (`docs/adr/0005-register-vi-ta-nguoi-en-neutral.md`): Vietnamese copy speaks as `ta` to `ngươi`; English stays neutral with `I`/`you`.
- **Format "Đổi ý"** is the default shape of a Post: old belief → evidence that broke it → new belief → what stays unclear.

## Layout

```
src/
  components/     PostCard, Pagination, TitleCard, ThemeToggle, LanguagePicker
  content/blog/   posts, one folder per locale
  content/cv/     CV data, one file per locale
  i18n/           ui.ts (all UI strings) and utils.ts (locale helpers)
  layouts/        BaseLayout.astro
  lib/posts.ts    post queries, pagination, translation lookup
  pages/          Vietnamese routes at the root, English mirrored under pages/en/
  styles/         global.css (Tailwind + daisyUI + article typography)
docs/adr/         why the repo is set up the way it is
GLOSSARY.md       the project's vocabulary
```

## Still to do

- Article typography is hand-rolled in `global.css`; `@tailwindcss/typography` is not installed.

## Deferred

Postponed on purpose — not to do now. Each says when it comes back:

- **CV page**: no route, no nav link; `src/content/cv/` stays as data (its `(TODO)` fields fill in then). Restart when job-hunting resumes.
- **Tags index**: tags are stored on posts but have no index page. Restart at ~10 Posts — current rhythm is ≈ 1 Post/month.
