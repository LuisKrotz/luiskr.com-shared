[**luiskr.com**](../../../../../../../README.md)

---

[luiskr.com](../../../../../../../README.md) / [core/utils/canvas/loaders/page-backdrop/loop](../README.md) / renderFrame

```ts
function renderFrame(host): void
```

Defined in: core/utils/canvas/loaders/page-backdrop/loop.ts:94

Draws the lobe field once — a static pose: no field clock, no
animation. A theme flip resamples the palette before the upload;
dirty flags gate the buffer writes so a steady frame is one
`drawArrays` and nothing else.

## Parameters

### host

[`PageBackdropWebGL`](../../../page-backdrop-webgl/classes/PageBackdropWebGL.md)

the backdrop instance to draw

## Returns

`void`
