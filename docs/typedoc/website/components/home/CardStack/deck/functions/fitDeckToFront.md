[**luiskr.com**](../../../../../../README.md)

---

[luiskr.com](../../../../../../README.md) / [website/components/home/cardstack/deck](../README.md) / fitDeckToFront

```ts
function fitDeckToFront(host): void
```

Defined in: website/components/home/cardstack/deck.ts:845

Re-fits the stacked deck's height to the TALLEST card's natural box —
never truncate, always fit: applyPoses gives every stacked card the
same pileH (ratio height + _frontExtra), and the measured max delta
parks as _frontExtra so a copy-heavy description sizes the WHOLE
pile, not just the card carrying it. Card border-boxes are then
invariant under gestures, navs, and class flips — the page absorbs
the overflow. The front card's ResizeObserver re-runs the fit when
fonts/locale/typewriter change the copy after mount. Fan tiers just
clear the artifact. One layout read per nav/mount — same class as
measure(), never per-frame.

## Parameters

### host

[`CardStack`](../../../CardStack/classes/CardStack.md)

The CardStack element.

## Returns

`void`
