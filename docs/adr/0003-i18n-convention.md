# Vietnamese at the root, English under /en, linked by translationKey

`i18n.defaultLocale` is `vi` with `routing.prefixDefaultLocale: false`, so `/` and `/blog/...` are Vietnamese while `/en/...` is English. Posts live at `src/content/blog/<locale>/<slug>.mdx` in a single `blog` collection, and a post may name its counterpart in the other locale with an optional `translationKey`; when it has none, the language switcher falls back to the blog index of the other locale. Astro documents the unprefixed default locale and the per-locale content folder, but nothing about pairing translations or about a `<link rel="alternate" hreflang>` for a switcher, so the pairing rule here is this repo's own.

## Considered options

- **Two collections (`blog`, `blogEn`)** — the schema would be duplicated and every query would branch on locale. Rejected.
- **Requiring every post in both locales** — blocks publishing a single-language post, which is the common case. Rejected.
- **Prefixing both locales (`/vi/...`, `/en/...`)** — lengthens the URL of the language the site is mostly written in. Rejected.

## Consequences

- A post can exist in one locale only; `translationKey` is optional.
- Page files are duplicated per locale (`src/pages/...` and `src/pages/en/...`), with the shared logic in `src/lib/posts.ts` and the shared markup in `src/components/`.
- The sitemap integration emits `hreflang` alternates between `vi-VN` and `en-US`.
- Each locale has its own RSS feed, `<language>` set through `customData` because `@astrojs/rss` has no locale option.
