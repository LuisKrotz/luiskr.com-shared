# `shared\src\app\view.ts`

View outlet reconciliation for AppRoot — same-tag routes delegate to onRouteParamChange; new views lazy-import their chunk then cross-fade (instant under reduced motion).

|                |                                                         |
| -------------- | ------------------------------------------------------- |
| **Source**     | `src/shared\src\app\view.ts`                            |
| **UX surface** | Boot surfaces: what the user sees first on each bundle. |

## Members

### `updateAppViewContent`

Route-change reconciliation for the view outlet: when the target view
tag equals the mounted one (and the element is actually defined), the
view is kept alive and told about the new route via onRouteParamChange —
project→project navigation must not tear down GL state. A tag change
delegates to _flipToView for the swap.

- `@param` c The AppRoot element.
- `@param` to Destination descriptor (falls back to router.currentRoute).
- `@param` _from Origin descriptor — unused, kept for listener parity.

### `parkReaderArticle`

Parks the prerendered reader article offscreen once a real view owns
the outlet. Until then it stays painted under the intro veil so its
content counts as early FCP/LCP. Idempotent — safe on every swap.

### (module scope)

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

- `@param` c The AppRoot element.
- `@param` outlet The #view-outlet element.
- `@param` _to Destination descriptor — the tag is read from c.currentViewTag.
