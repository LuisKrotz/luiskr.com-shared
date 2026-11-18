[**luiskr.com**](../../../../../../../README.md)

---

[luiskr.com](../../../../../../../README.md) / [core/utils/canvas/loaders/page-backdrop/init](../README.md) / triggerFallback

```ts
function triggerFallback(host): void
```

Defined in: core/utils/canvas/loaders/page-backdrop/init.ts:108

Switches to the CSS lobe path — used on context loss, init failure, or
an unparseable palette. Releases every GL resource and clears the
document marker so `--bg-glow*` paint again.

## Parameters

### host

[`PageBackdropWebGL`](../../../page-backdrop-webgl/classes/PageBackdropWebGL.md)

the backdrop instance falling back

## Returns

`void`
