[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/dom/joust](../README.md) / joustDirectTap

```ts
function joustDirectTap(): boolean
```

Defined in: core/utils/dom/joust.ts:58

True when the current activation followed a touch or pen pointerdown —
direct-manipulation presses that must bypass the joust pour outright
(a first tap that only expands the label reads as a dead press). A
stale value can only ever widen the bypass by one activation — the
next real pointer press refreshes it.

## Returns

`boolean`

True for touch/pen-originated input.
