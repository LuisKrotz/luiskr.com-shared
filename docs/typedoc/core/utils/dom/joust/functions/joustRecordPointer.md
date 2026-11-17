[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/dom/joust](../README.md) / joustRecordPointer

```ts
function joustRecordPointer(e): void
```

Defined in: core/utils/dom/joust.ts:46

Records a pointerdown's pointer type for the activation that follows.
The app's input listeners already classify every press — this just
keeps the last type where the click handlers can reach it.

## Parameters

### e

`Event`

The pointerdown event.

## Returns

`void`
