[**luiskr.com**](../../../../../README.md)

---

[luiskr.com](../../../../../README.md) / [shared/src/app/view](../README.md) / flipAppView

```ts
function flipAppView(c, outlet, _to?): Promise<void>
```

Defined in: shared/src/app/view.ts:100

View swap: lazy-imports the target view's chunk (each import is in its
own branch so bundlers keep per-route code-splitting), then either
instant-replaces the outlet (reduced motion / empty outlet) or plays
the OVERLAPPING cross-fade — the incoming view mounts in flow beneath
the outgoing view, which lifts to an absolute overlay and fades on
top for PAGE_FADE_HALF before being removed. The overlap is the
no-void contract: the outlet never sits empty between the out-leg
and the incoming first paint, so the page background can never flash
through (the dark-mode black frame). `_sectionsMeasured` resets so
the new view's sections re-measure lazily. After the awaited import
the outlet is revalidated: a flip superseded mid-flight aborts, and
an outlet whose live child already IS the target (the shell's JSX
seats <CurrentView> before the chunk upgrades) receives the route
params and skips the swap — never a double mount.

## Parameters

### c

[`AppRoot`](../../../App/classes/AppRoot.md)

The AppRoot element.

### outlet

`Element`

The #view-outlet element.

### \_to?

[`RouteDescriptor`](../../../../../core/router/types/interfaces/RouteDescriptor.md)

Destination descriptor — the tag is read from c.currentViewTag.

## Returns

`Promise`\<`void`\>
