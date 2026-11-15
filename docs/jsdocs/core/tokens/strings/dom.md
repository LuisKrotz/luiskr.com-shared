# `core\tokens\strings\dom.ts`

DOM property/markup string tokens — grouped subset of

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\tokens\strings\dom.ts`                          |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### `DOM_STRINGS`

Frozen dom string map — sole declaration site for these tokens; consumers read members and
never re-declare the strings (zero-hardcoding rules 4–5). Object.freeze makes the token
contract immutable at runtime.

### `REL_ALTERNATE`

`alternate` — rel value for feed/hreflang/print alternate links.

### `NO_AUDIO_LABEL`

Caption-track label for muted ambient videos — the track exists to
declare there is nothing to transcribe.

### `RESIZE_OBSERVER_LOOP`

Signature inside the window 'error' message the browser emits when
ResizeObserver callbacks overflow one frame's delivery ("ResizeObserver
loop completed with undelivered notifications") — informational only:
the pending notification re-fires next frame. The global error handler
logs it but must never surface it as a user-facing failure toast.
