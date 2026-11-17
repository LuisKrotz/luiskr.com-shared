[**luiskr.com**](../../../../../../README.md)

---

[luiskr.com](../../../../../../README.md) / [website/components/portfolio/related/data](../README.md) / fetchData

```ts
function fetchData(host): void
```

Defined in: website/components/portfolio/related/data.ts:36

Fires two SWR reads in parallel: the home page node (for the
portfoliolist used as the image/description join table) and the
components/related node (title, path, socials, project pointers).
A store hit resolves instantly; a miss round-trips Firebase. Each read
passes its applier as onUpdate so a build-snapshot↔live divergence
(CMS edits landing after the snapshot was cut) re-renders the strip
instead of pinning the stale list until the next mount.

## Parameters

### host

[`PortfolioRelated`](../../../Related/classes/PortfolioRelated.md)

## Returns

`void`
