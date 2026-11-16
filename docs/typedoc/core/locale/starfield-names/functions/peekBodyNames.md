[**luiskr.com**](../../../../README.md)

---

[luiskr.com](../../../../README.md) / [core/locale/starfield-names](../README.md) / peekBodyNames

```ts
function peekBodyNames(locale?): SFBodyNames | null
```

Defined in: core/locale/starfield-names.ts:149

Synchronous read of an already-landed names table — `localeUrl` is a
pure sync builder, so the lang dialog resolves body segments only
from tables the star-field view (or a prior switch) already fetched.
A miss simply yields null and the caller falls back to the locale-
invariant catalog id, which every locale's deep-link resolver accepts.

## Parameters

### locale?

`string` \| `null`

Locale code — defaults to the store's current.

## Returns

[`SFBodyNames`](../interfaces/SFBodyNames.md) \| `null`

The resolved names table, or null when never fetched/failed.
