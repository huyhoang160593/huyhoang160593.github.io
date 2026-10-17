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

/** The same page in the other locale, for a path whose shape is shared. */
export function switchLangPath(pathname: string, target: Lang): string {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return localizePath(stripped, target);
}

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "long",
  }).format(date);
}
