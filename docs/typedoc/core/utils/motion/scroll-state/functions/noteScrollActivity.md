[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/motion/scroll-state](../README.md) / noteScrollActivity

```ts
function noteScrollActivity(): void
```

Defined in: core/utils/motion/scroll-state.ts:105

Flags a scroll-class gesture as in progress — for element scrollers
(carousel tracks) and drag decks (the card-stack swipe) whose scrolls/
pans never emit a window scroll event. Without this marker the
is-scrolling state misses their gestures entirely, so parked work —
media-layer publishes, DOM-bitmap encodes, LOADED-class flips — fires
mid-swipe and eats the frame budget. Re-arms the same settle debounce
a window scroll uses; call it from the element's own scroll/move
stream.

## Returns

`void`
