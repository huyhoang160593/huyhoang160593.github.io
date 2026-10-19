# Vietnamese copy speaks as `ta` to `ngươi`; English copy stays neutral

Every piece of Vietnamese copy on the site — UI strings, titles, the About page, the 404,
and every Post — speaks of the author as `ta` and addresses the reader as `ngươi`. The
English locale does not attempt the equivalent: it uses plain `I` and `you`. The pronoun
pair is where the site's character lives in Vietnamese; it has no English counterpart, and
mirroring it would produce English written for effect rather than to be read.

## Considered options

- **Mirroring the register in English** (`thou`, a third person, or an invented equivalent)
  — rejected: the construction reads as affectation, and the character does not survive the
  trip into English either way.
- **Neutral Vietnamese (`tôi`/`bạn`), character confined to the design** — rejected: voice is
  one of the two carriers of the site's identity, and CSS cannot carry the other one.
- **A different character per locale** — rejected: both locales must read as one author, and
  an English locale that sounds like a different person is worse than one that sounds plainer.

## Consequences

- `GLOSSARY.md` defines **Register**; it applies to all copy, including error pages and
  system messages, not only Posts.
- A Translation is never literal about pronouns: it renders meaning and tone, not the
  address form. This is a stated reason a Translation is optional — see ADR 0003.
- New UI strings are written in the register at the source, in `src/i18n/ui.ts`, not
  retrofitted afterwards.
