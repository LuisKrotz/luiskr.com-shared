[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/tokens/selectors/skeleton](../README.md) / SKELETON\_SELECTORS

```ts
const SKELETON_SELECTORS: Readonly<{
  SKELETON_ANY: '[class*="skeleton-"]'
}>
```

Defined in: core/tokens/selectors/skeleton.ts:14

Frozen skeleton selector map — sole declaration site for these tokens; consumers read
members and never re-declare the strings (zero-hardcoding rules 4–5). Object.freeze makes
the token contract immutable at runtime.
