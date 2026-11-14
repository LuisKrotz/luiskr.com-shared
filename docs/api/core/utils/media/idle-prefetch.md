# `core\utils\media\idle-prefetch.ts`

Background asset warming while the tab is hidden.

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\utils\media\idle-prefetch.ts`                   |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### `armed`

Armed-once latch — init is idempotent across repeated boot calls.

### `running`

A warm cycle is in flight — the visibility handler never double-starts.

### `cycle`

Abort handle for the in-flight cycle (null while idle).

### `armTimer`

Arm-delay timer after `hidden` — cancelled when the tab returns early.

### `done`

URLs already warmed (or in flight) — dedupes cycles and routes.

### `queue`

Backlog shared across cycles — leftovers resume on the next hide.

### `queued`

In-queue dedupe for URLs collected but not yet fetched.

### `onVisibility`

The visibilitychange handler — kept for removeEventListener symmetry.

### `arm`

Schedules a warm cycle after the arm delay if the tab stays hidden —
quick Alt-Tab peeks never reach the network.

### `abortCycle`

Cancels the pending arm (if any) and aborts the in-flight cycle.

### `networkTooExpensive`

Whether the network is too constrained for background warming —
`saveData` or a 2g-class effective type means the user's bytes are
precious and the tab-hidden download would be unwelcome.

### `collectCdnUrls`

Every CDN media URL referenced anywhere in the composed tree — img
`src`/`srcset` entries, `source` `srcset`, `video` `src`/`poster`.
Shadow roots are walked recursively so component-rendered media
(mosaic tiles, carousel figures, related cards) counts too.

### `expandVariants`

Expands the collected set with manifest-proven derivative rungs —
the DOM only references the tier it painted first, but the ladder
upgrade path (webp siblings, higher-quality mozjpgs) is exactly what
interaction would trigger later, so it warms alongside.

### `enqueue`

Enqueues a URL unless it is already warmed or already waiting.

### `startCycle`

Runs one warm cycle — collects the route's CDN URLs, expands variants,
then drains the backlog with the configured worker pool. Each worker
shares the cycle's AbortSignal so returning the tab drops every
in-flight request immediately.

### `initIdlePrefetch`

Arms the background prefetch listener — call once at boot (deferred,
off the critical path). Idempotent: repeated calls are a no-op.

### `destroyIdlePrefetch`

Detaches the listener and aborts any in-flight cycle — exported for
test teardown so a warm cycle can't outlive its suite.

### `_resetIdlePrefetch`

Test seam — clears the warm/queue bookkeeping so a suite can drive
multiple hide/show cycles without cross-test bleed.
