import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Posts live in `src/content/blog/<locale>/<slug>.mdx`, so an entry id is
 * `vi/my-post` and the URL segment is the part after the locale folder.
 * `translationKey` optionally links a post to its counterpart in the other
 * locale; see docs/adr/0003-i18n-convention.md.
 */
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      translationKey: z.string().optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      /** Where the Post sits in the running order (GLOSSARY: Episode).
       *  Positive, declared explicitly, optional only while drafting. */
      episode: z.number().int().positive().optional(),
    })
    .refine((post) => post.draft || post.episode !== undefined, {
      message:
        "a published Post must declare its Episode: `episode`, a positive integer — drafts may leave it unset",
      path: ["episode"],
    }),
});

/**
 * One CV per locale, as structured data rather than prose, so the page can
 * render it and other formats can reuse it later.
 */
const cv = defineCollection({
  loader: glob({ base: "./src/content/cv", pattern: "**/*.{yaml,yml,json}" }),
  schema: z.object({
    name: z.string(),
    headline: z.string(),
    summary: z.string().optional(),
    contact: z.object({
      email: z.string().optional(),
      github: z.string().optional(),
      website: z.string().optional(),
    }),
    experience: z.array(
      z.object({
        role: z.string(),
        org: z.string(),
        start: z.string(),
        end: z.string().optional(),
        summary: z.string().optional(),
        highlights: z.array(z.string()).default([]),
      }),
    ),
    education: z.array(
      z.object({
        degree: z.string(),
        org: z.string(),
        start: z.string(),
        end: z.string().optional(),
      }),
    ),
    skills: z.array(z.string()),
  }),
});

export const collections = { blog, cv };
