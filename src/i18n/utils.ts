import { defaultLang, ui } from "./ui";

export type Lang = keyof typeof ui;

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in ui;
}

/**
 * The locale of a page, read from the URL prefix. The default locale is
 * unprefixed, so anything else falls back to it.
 */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split("/");
  return isLang(first) ? first : defaultLang;
}

export function useTranslations(lang: Lang) {
  const localized: Record<string, string> = ui[lang];
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return localized[key] ?? ui[defaultLang][key];
  };
}

/** Prefix a site-root path with the locale, unless it is the default one. */
export function localizePath(path: string, lang: Lang): string {
  const rooted = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLang) return rooted;
  return rooted === "/" ? `/${lang}/` : `/${lang}${rooted}`;
}

/** Strip the `/en` locale prefix from a pathname, if present. The default
 * locale is unprefixed, so this turns a localized path back into its
 * locale-neutral shape; the same page can then be re-prefixed for another. */
export function stripLangPrefix(pathname: string): string {
  return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
}

/** The same page in the other locale, for a path whose shape is shared. */
export function switchLangPath(pathname: string, target: Lang): string {
  return localizePath(stripLangPrefix(pathname), target);
}

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "long",
  }).format(date);
}

/**
 * The Post title card's eyebrow: the localized Episode label joined to the
 * existing date — `Tập 03 · 17 tháng 10 năm 2026`, `Ep. 03 · October 17,
 * 2026` — or the date alone when the Post declares no episode (drafts may
 * leave it unset). The number is padded to two digits so a running list
 * reads in a steady rhythm; 100 and up needs no padding.
 */
export function formatEpisodeEyebrow(
  date: Date,
  lang: Lang,
  episode?: number,
): string {
  const dateText = formatDate(date, lang);
  if (episode === undefined) return dateText;
  const label = ui[lang]["blog.episode"];
  return `${label} ${String(episode).padStart(2, "0")} · ${dateText}`;
}
