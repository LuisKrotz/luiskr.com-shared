[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/tokens/events/dom](../README.md) / SW\_TIMING

```ts
const SW_TIMING: Readonly<{
  UPDATE_CHECK_MS: 300000
}>
```

Defined in: core/tokens/events/dom.ts:208

ServiceWorker update-check cadence — how often a live page asks the
browser to look for a new worker so an open tab cannot sit on a stale
module graph across a deploy (the renamed-chunk "x is not defined"
sessions in the error feed).
