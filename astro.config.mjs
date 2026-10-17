// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // The repo is the user page <username>.github.io, so the site lives at the
  // domain root and no `base` is needed. See docs/adr/0003-i18n-convention.md.
  site: "https://huyhoang160593.github.io",
  i18n: {
    defaultLocale: "vi",
    locales: ["vi", "en"],
    routing: {
      // Vietnamese (the default locale) is served unprefixed: `/` and `/blog/...`.
      // English lives under `/en/...`.
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "vi",
        locales: { vi: "vi-VN", en: "en-US" },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
