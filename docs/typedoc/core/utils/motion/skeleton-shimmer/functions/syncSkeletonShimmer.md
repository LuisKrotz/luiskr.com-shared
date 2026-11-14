[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/motion/skeleton-shimmer](../README.md) / syncSkeletonShimmer

```ts
function syncSkeletonShimmer(component): void
```

Defined in: core/utils/motion/skeleton-shimmer.ts:41

Keeps a component's skeleton shimmer in sync with its rendered
content — call from connectedCallback after the render lands. While
placeholders exist the CSS does all the painting; the first render
that no longer contains them gets the `skeleton-content-in` fade
(timed removal mirrors the old layer's resolve-out pacing).

## Parameters

### component

[`BaseComponent`](../../../../Component/classes/BaseComponent.md)

The host component whose content is being watched.

## Returns

`void`
