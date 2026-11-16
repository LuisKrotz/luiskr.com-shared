[**luiskr.com**](../../../../../../README.md)

---

[luiskr.com](../../../../../../README.md) / [website/components/media/draw-text/render](../README.md) / parseTokens

```ts
function parseTokens(text): DrawToken[]
```

Defined in: website/components/media/draw-text/render.ts:70

Tokenizes the text into word/space/br/inline-tag chunks. Words split
at spaces and each character gets a global index `ci`. Spaces and
<br>s become layout-only tokens so line breaking stays identical to
unsplit text. The regex walks <br>, <tag>…</tag> (attrs preserved,
group 3 back-referenced for the closing tag), and bare text — so
inline markup inside CMS copy (e.g. an <em> or <a>) animates as one
continuous sequence. Only phrasing/content tags from
HTML_PHRASING_TAGS survive: any other paired tag is unwrapped to its
inner tokens (text still animates, the element never reaches
innerHTML), and surviving attrs pass through sanitizeAttrString so
`on*=` handlers and scriptable URL schemes cannot ride along.

## Parameters

### text

`string`

## Returns

[`DrawToken`](../../types/interfaces/DrawToken.md)[]
