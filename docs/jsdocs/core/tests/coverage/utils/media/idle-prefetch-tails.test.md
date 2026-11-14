# `core\tests\coverage\utils\media\idle-prefetch-tails.test.js`

Coverage tails for utils/media/idle-prefetch.ts — the

|                |                                                                   |
| -------------- | ----------------------------------------------------------------- |
| **Source**     | `src/core\tests\coverage\utils\media\idle-prefetch-tails.test.js` |
| **UX surface** | Shared primitives every surface builds on — no direct UI.         |

## Members

### `MANIFEST_LIST`

Bucket key list the first manifest fetch latches — `initMediaManifest`
loads ONCE per module state, so the file's first stubbed response is
the only one that lands. Everything later tests need proven must be
in this list.

### `res`

Fake Response stand-in for the manifest + warm fetches.

### `setVis`

Sets document.visibilityState for the duration of a test.

### `setConn`

Sets navigator.connection (or deletes it with `undefined`).

### `mountMedia`

Mounts an img/video tree (with optional shadow root) for collection.

### `flush`

Drains queued microtasks — the async warm cycle is several awaits deep.
