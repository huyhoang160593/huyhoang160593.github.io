import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getPosts, postSlug } from "../lib/posts";
import { localizePath } from "../i18n/utils";
import { ui } from "../i18n/ui";

export async function GET(context: APIContext) {
  const posts = await getPosts("vi");

  return rss({
    title: `${ui.vi["site.name"]} · ${ui.vi["blog.title"]}`,
    description: ui.vi["blog.description"],
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: localizePath(`/blog/${postSlug(post)}`, "vi"),
    })),
    customData: "<language>vi-VN</language>",
  });
}
