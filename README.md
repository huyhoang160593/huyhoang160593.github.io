# Personal Website

A bilingual personal site: a blog in Vietnamese and English, with a CV page planned next. Static, built with Astro, deployed to GitHub Pages.

- Vietnamese is the default locale and lives at the root (`/`, `/blog/...`); English lives under `/en/...`.
- Package manager is **`nub`** with a committed `pnpm-lock.yaml` (see `docs/adr/0001`).
- Styling is Tailwind CSS 4 with daisyUI 5, themed `retro` (light, default) and `synthwave` (dark).

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
translationKey: some-slug # optional: links this post to its counterpart
draft: false # optional: hides the post from a production build
tags: [meta] # optional
---

Nội dung.
```

The file name becomes the URL: `src/content/blog/vi/xin-chao.mdx` is `/blog/xin-chao`, and `src/content/blog/en/hello.mdx` is `/en/blog/hello`. Slugs may differ between locales; `translationKey` is what links a post to its translation, and it drives the language switcher.

## Layout

```
src/
  components/     PostCard, Pagination, ThemeToggle, LanguagePicker
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

- Replace the placeholder copy: `home.intro` in `src/i18n/ui.ts`, and the `(TODO)` fields in `src/content/cv/`.
- Add the CV page, rendering `src/content/cv/<locale>.yaml`.
- Tags are stored on posts but have no index page yet.
- Article typography is hand-rolled in `global.css`; `@tailwindcss/typography` is not installed.
