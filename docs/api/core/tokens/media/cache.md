# `core\tokens\media\cache.ts`

IndexedDB media disk-cache + network cache-mode tokens.

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\tokens\media\cache.ts`                          |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### `CACHE_CONFIG`

Caches config.

### `IDLE_PREFETCH`

Idle-prefetch tuning — background asset warming while the tab is
hidden (`document.visibilitychange`). Kept conservative on purpose:
the page must stay cheap to keep alive, so warming is throttled to a
small concurrent pool of low-priority no-cors GETs and skips
metered/slow connections entirely.

### `CONCURRENCY`

Concurrent warm requests in flight at once.

### `ARM_DELAY_MS`

Settle delay after the tab hides — transient tab switches never start a cycle.

### `MODE_NO_CORS`

fetch mode — opaque CDN GETs still land in the HTTP/image cache.

### `CREDENTIALS_OMIT`

No cookies on the CDN bucket — keeps the warm request credentials-free.

### `CONNECTION_SAVE_DATA`

navigator.connection member names (non-standard but widely shipped).

### `SLOW_EFFECTIVE_TYPES`

effectiveType values treated as too constrained to warm in the background.
