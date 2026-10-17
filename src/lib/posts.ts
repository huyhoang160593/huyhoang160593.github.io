import { getCollection, type CollectionEntry } from "astro:content";
import { defaultLang } from "../i18n/ui";
import type { Lang } from "../i18n/utils";

export type Post = CollectionEntry<"blog">;

/** Drafts are hidden in a production build, visible while developing. */
function isVisible(post: Post): boolean {
  return import.meta.env.PROD ? !post.data.draft : true;
}

/** The locale of a post, taken from the folder it lives in. */
export function postLocale(post: Post): Lang {
  const [prefix] = post.id.split("/");
  return prefix === "vi" || prefix === "en" ? prefix : defaultLang;
}

/** The URL segment of a post: its id without the locale folder. */
export function postSlug(post: Post): string {
  return post.id.replace(/^(vi|en)\//, "");
}

export async function getPosts(lang: Lang): Promise<Post[]> {
  const posts = await getCollection("blog", ({ id }) =>
    id.startsWith(`${lang}/`),
  );
  return posts
    .filter(isVisible)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Every published post, both locales, newest first. */
export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection("blog");
  return posts
    .filter(isVisible)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** How many posts one page of the blog index holds. */
export const PAGE_SIZE = 10;

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function pageSlice(posts: Post[], page: number): Post[] {
  const start = (page - 1) * PAGE_SIZE;
  return posts.slice(start, start + PAGE_SIZE);
}

/** The counterpart of a post in the other locale, when it declares one. */
export function findTranslation(post: Post, all: Post[]): Post | undefined {
  const key = post.data.translationKey;
  if (!key) return undefined;
  return all.find(
    (candidate) =>
      candidate.data.translationKey === key &&
      postLocale(candidate) !== postLocale(post),
  );
}
