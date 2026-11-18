[**luiskr.com**](../../../../../../README.md)

---

[luiskr.com](../../../../../../README.md) / [website/components/home/cardstack/deck](../README.md) / applyPoses

```ts
function applyPoses(host): void
```

Defined in: website/components/home/cardstack/deck.ts:501

Writes every card's pose for the current virtual front `f` — derived
from `activeIdx - _dragX/_step`, so a live drag slides the whole
coverflow continuously and `activeIdx` alone reproduces the rest pose.
Every DOM write is value-guarded: card box properties and the deck
perspective (the tier's camera distance) compare against the current
inline value before touching it, and a card whose whole pose
signature matched the last pass is skipped outright — re-delivered
observer passes cost compares, not relayouts. Runs inside the
gesture rAF — reads are cached fields and inline-style values.

## Parameters

### host

[`CardStack`](../../../CardStack/classes/CardStack.md)

The CardStack element.

## Returns

`void`
