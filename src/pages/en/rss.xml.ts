import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getPosts, postSlug } from "../../lib/posts";
import { localizePath } from "../../i18n/utils";
import { ui } from "../../i18n/ui";

export async function GET(context: APIContext) {
  const posts = await getPosts("en");

  return rss({
    title: `${ui.en["site.name"]} · ${ui.en["blog.title"]}`,
    description: ui.en["blog.description"],
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: localizePath(`/blog/${postSlug(post)}`, "en"),
    })),
    customData: "<language>en-US</language>",
  });
}
