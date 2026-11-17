# `core\utils\motion\scroll-state.ts`

Global "is the window currently scrolling" flag plus an

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\utils\motion\scroll-state.ts`                   |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### `SETTLE_MS`

Settle window — a gap this long with no scroll/scrollend ends the gesture.

### `isWindowScrolling`

Live scroll flag — true while the user is actively scrolling the window.

### `scrollStopTimer`

Debounce handle — reset on every scroll event so it fires only on stop.

### `scrollStopCallbacks`

Subscribers invoked once per scroll-settle, then cleared.

### `handleScrollStop`

Fires when scrolling settles: clears the flag and drains pending callbacks.

### `handleScroll`

Marks scrolling as active and arms the settle debounce for the gesture.

### `handleScrollEnd`

scrollend only re-arms the settle debounce — it can never end the gesture
by itself. A real gesture's tail (last scroll → scrollend) settles
SETTLE_MS later; a per-write scrollend inside a programmatic scroll stream
gets absorbed when the next scroll event re-arms the same timer first.
An orphan scrollend while idle is a no-op — it never latches the flag.

### `isScrolling`

True while a window scroll gesture is in progress.

### `noteScrollActivity`

Flags a scroll-class gesture as in progress — for element scrollers
(carousel tracks) and drag decks (the card-stack swipe) whose scrolls/
pans never emit a window scroll event. Without this marker the
is-scrolling state misses their gestures entirely, so parked work —
media-layer publishes, DOM-bitmap encodes, LOADED-class flips — fires
mid-swipe and eats the frame budget. Re-arms the same settle debounce
a window scroll uses; call it from the element's own scroll/move
stream.

### `onScrollStop`

Queues a one-shot callback for the next scroll stop; fires immediately
when the window isn't scrolling right now.
