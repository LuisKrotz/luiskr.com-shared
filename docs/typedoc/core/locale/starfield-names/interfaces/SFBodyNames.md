[**luiskr.com**](../../../../README.md)

---

[luiskr.com](../../../../README.md) / [core/locale/starfield-names](../README.md) / SFBodyNames

Defined in: core/locale/starfield-names.ts:24

Locale body-name table — `byId` feeds the navigator rows, hover
tooltips and the URL segment; `bySlug` (each name run through the
shared `slugify` — NFD-fold, lowercase, `-` runs) resolves translated
deep-link segments back to the canonical catalog id.

## Properties

### byId

```ts
byId: Map<string, string>
```

Defined in: core/locale/starfield-names.ts:26

Canonical body id → localized display name.

---

### bySlug

```ts
bySlug: Map<string, string>
```

Defined in: core/locale/starfield-names.ts:28

`slugify(localized name)` → canonical body id.
