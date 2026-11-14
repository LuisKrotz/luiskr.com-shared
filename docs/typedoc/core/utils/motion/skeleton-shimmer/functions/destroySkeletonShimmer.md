[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/motion/skeleton-shimmer](../README.md) / destroySkeletonShimmer

```ts
function destroySkeletonShimmer(component): void
```

Defined in: core/utils/motion/skeleton-shimmer.ts:73

Component-unmount teardown — cancels a pending content-in cleanup
and drops the shimmer record. No resolve-out: the host is going
away, so a fade would never be seen.

## Parameters

### component

[`BaseComponent`](../../../../Component/classes/BaseComponent.md)

The host component being unmounted.

## Returns

`void`
