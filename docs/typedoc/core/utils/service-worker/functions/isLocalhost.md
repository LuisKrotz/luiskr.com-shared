[**luiskr.com**](../../../../README.md)

---

[luiskr.com](../../../../README.md) / [core/utils/service-worker](../README.md) / isLocalhost

```ts
function isLocalhost(): boolean
```

Defined in: core/utils/service-worker.ts:113

True on local origins — localhost names, loopback IPs, and [::1].
The original package treated these as "probably dev" and probed
before registering; preserved identically. Exported so entry gates
(`registerServiceWorker`) can treat local origins as non-production —
a leftover preview worker would otherwise keep serving an older
precached shell against a rebuilt dist.

## Returns

`boolean`
