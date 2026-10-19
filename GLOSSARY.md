# Personal Website

A bilingual personal site: a blog written in Vietnamese first, with English translations where they earn their cost. Static, built with Astro, deployed to GitHub Pages.

## Language

**Post**:
An article in the blog, written in one Locale.
_Avoid_: article, entry, note

**Translation**:
The Post in the other Locale that covers the same subject. A Post may have none; a Translation is never required.
_Avoid_: copy, mirror, version

**Locale**:
A language the site is published in: `vi` (the default) or `en`.
_Avoid_: language, lang

**Slug**:
The URL segment that identifies a Post within its Locale.
_Avoid_: permalink, path

**Collection**:
A named group of content entries the site reads: `blog` and `cv`.
_Avoid_: folder, content type

**Theme**:
One of the two colour schemes the site ships: `cat-cafe` (light, the default) and `game-center` (dark). A reader's choice is remembered between visits.
_Avoid_: mode, skin, dark mode

**Page**:
A rendered route that is not a Post, such as the home page, the blog index or the 404 page.
_Avoid_: view, screen

**About**:
A Page telling who the author is: what they do, who they are outside of code, and how to reach them.
_Avoid_: bio, profile, intro

## Writing

**Format**:
The shape a Post follows by default: what was believed before, what disproved it, what is believed now, and what remains unclear. A Post may depart from it.
_Avoid_: template, structure, outline

**Episode**:
The number of a Post in the blog's running order. It counts up from the first Post and never resets.
_Avoid_: index, sequence, order

## Voice

**Register**:
The pronoun convention of the site's copy. Vietnamese copy uses `ta` addressing the reader as `ngươi`, everywhere. English copy stays neutral, with `I` and `you`.
_Avoid_: tone of voice, persona, wording
