[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [core/utils/data/db](../README.md) / fetchFirebaseDb

```ts
function fetchFirebaseDb(path, onUpdate?): Promise<DbSnapshot>
```

Defined in: core/utils/data/db.ts:184

Reads a database node.

Static first: translation paths resolve instantly from the build-time
snapshot of database.json, then revalidate against Firebase in the
background. When the live value differs, the cache is updated and every
registered `onUpdate` fires — each caller that passed one gets the
callback, including callers that hit an already-cached promise, so a
remounted reader still re-renders with CMS edits made after the last
deploy. Non-translation paths go straight to the network with the
localStorage copy as offline fallback.

## Parameters

### path

`string`

### onUpdate?

(`_snapshot`) => `void`

## Returns

`Promise`\<[`DbSnapshot`](../interfaces/DbSnapshot.md)\>
