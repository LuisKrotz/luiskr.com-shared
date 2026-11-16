[**luiskr.com**](../../../../README.md)

---

[luiskr.com](../../../../README.md) / [core/utils/string](../README.md) / sanitizeAttrString

```ts
function sanitizeAttrString(attrStr): string
```

Defined in: core/utils/string.ts:136

Strips the executable surface from a raw HTML attribute string. Tokenizers
that re-emit authored markup (draw-text char spans) pass attribute text
through verbatim, so `on*=` event handlers and `javascript:`/`vbscript:`/
non-image `data:` URL schemes are removed before the string reaches
innerHTML. Presentation attributes (class, style, data-_, aria-_) pass
through untouched — this scrubs vectors, it does not allowlist attrs.
Pure ESM utility function, tree-shakeable.

## Parameters

### attrStr

`string`

— raw attribute text captured between a tag name and `>`.

## Returns

`string`

attribute text safe to embed inside a tag.
