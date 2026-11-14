[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/tokens/media/cache](../README.md) / IDLE\_PREFETCH

```ts
const IDLE_PREFETCH: Readonly<{
  CONCURRENCY: 4
  ARM_DELAY_MS: 1200
  MODE_NO_CORS: 'no-cors'
  CREDENTIALS_OMIT: 'omit'
  CONNECTION_SAVE_DATA: 'saveData'
  CONNECTION_EFFECTIVE_TYPE: 'effectiveType'
  SLOW_EFFECTIVE_TYPES: readonly string[]
}>
```

Defined in: core/tokens/media/cache.ts:35

Idle-prefetch tuning — background asset warming while the tab is
hidden (`document.visibilitychange`). Kept conservative on purpose:
the page must stay cheap to keep alive, so warming is throttled to a
small concurrent pool of low-priority no-cors GETs and skips
metered/slow connections entirely.
