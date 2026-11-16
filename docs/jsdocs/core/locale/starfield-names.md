# `core\locale\starfield-names.ts`

Star-field body-name tables — fetches

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\locale\starfield-names.ts`                      |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### (module scope)

Locale body-name table — `byId` feeds the navigator rows, hover
tooltips and the URL segment; `bySlug` (each name run through the
shared `slugify` — NFD-fold, lowercase, `-` runs) resolves translated
deep-link segments back to the canonical catalog id.

### `byId`

Canonical body id → localized display name.

### `bySlug`

`slugify(localized name)` → canonical body id.

### `_namesCache`

In-flight + resolved names cache — locale → parsed name table.

### `_namesResolved`

Sync mirror of `_namesCache` — populated as each fetch lands so
`peekBodyNames` can answer without awaiting (localeUrl hrefs).

### `dossierLocale`

Legacy locale aliases — pt/hrx/tli URLs map onto the modern codes
whose dossier folders hold the translations.

- `@param` locale Active locale code (may be null/undefined).
- `@returns` The dossier folder code to fetch.

### `buildNames`

Builds the names table from a parsed `names.json` payload — forward
map verbatim, reverse map keyed by each name's `slugify` output so a
localized route segment (`…/via-lactea`) resolves to its catalog id.
Slug collisions keep the first id — dossier names are unique within a
locale by contract, but a degenerate duplicate must not clobber the
catalog body that legitimately owns the segment.

- `@param` raw Parsed `{ id: name }` object.
- `@returns` The paired lookup maps.

### `fetchNamesJson`

One names-file GET — resolves null on HTTP/parse failure (the UI
falls back to catalog names + raw ids) rather than throwing.

- `@param` url Names-file URL under `SF_DATA_BASE`.
- `@param` code Locale folder for diagnostics.
- `@returns` The parsed `{ id: name }` map or null.

### `fetchBodyNames`

Fetches the locale's body-name table — `data/<locale>/names.json`,
with the canonical English file as fallback. One ~6 KB document per
locale, cached per locale code: the navigator renders localized rows
and the router reads/writes translated body segments without pulling
all 143 dossier files.

- `@param` locale Active locale code — defaults to the store's current.
- `@returns` The names table, or null when both fetches fail.

### `peekBodyNames`

Synchronous read of an already-landed names table — `localeUrl` is a
pure sync builder, so the lang dialog resolves body segments only
from tables the star-field view (or a prior switch) already fetched.
A miss simply yields null and the caller falls back to the locale-
invariant catalog id, which every locale's deep-link resolver accepts.

- `@param` locale Locale code — defaults to the store's current.
- `@returns` The resolved names table, or null when never fetched/failed.
