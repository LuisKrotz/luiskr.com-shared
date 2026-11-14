# `core\utils\motion\skeleton-shimmer.ts`

Component-level skeleton-shimmer sync — the CSS-only

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\utils\motion\skeleton-shimmer.ts`               |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### (module scope)

Per-component shimmer bookkeeping — whether the last synced render
still showed placeholders, and the pending content-in fade timer.
A WeakMap keeps the state off the component instance and lets
teardown vanish with GC even if destroy is skipped.

### `had`

True while the previous render still contained placeholders.

### `timer`

Pending content-in cleanup timer id, or null.

### `_shimmerState`

Live shimmer records keyed by component — see ShimmerState.

### `syncSkeletonShimmer`

Keeps a component's skeleton shimmer in sync with its rendered
content — call from connectedCallback after the render lands. While
placeholders exist the CSS does all the painting; the first render
that no longer contains them gets the `skeleton-content-in` fade
(timed removal mirrors the old layer's resolve-out pacing).

- `@param` component The host component whose content is being watched.

### `destroySkeletonShimmer`

Component-unmount teardown — cancels a pending content-in cleanup
and drops the shimmer record. No resolve-out: the host is going
away, so a fade would never be seen.

- `@param` component The host component being unmounted.
