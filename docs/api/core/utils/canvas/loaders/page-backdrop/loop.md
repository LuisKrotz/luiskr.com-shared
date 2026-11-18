# `core\utils\canvas\loaders\page-backdrop\loop.ts`

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\utils\canvas\loaders\page-backdrop\loop.ts`     |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### `start`

Begins rendering: samples the palette (an unparseable surface colour
falls back to CSS), sizes the buffer, stamps the document marker that
pins the CSS glow layers to `none`, and draws the one static dithered
frame. High contrast keeps the flat surface: nothing starts while it
is on.

- `@param` host - the backdrop instance to start

### `stop`

Stops rendering and clears the document marker so the CSS glow layers
paint again while the canvas is idle/hidden.

- `@param` host - the backdrop instance to stop

### `handleResize`

Syncs the backing store with the viewport — then redraws the static
frame so the resized buffer never presents a stretched stale pose.
The canvas is fixed and fullscreen, so the viewport IS its box — no
layout read needed. DPR is capped (the dither only needs device
pixels, not supersampling) and each axis is capped so a 4K×2 display
never allocates a giant buffer.

- `@param` host - the backdrop instance to resize

### `renderFrame`

Draws the lobe field once — a static pose: no field clock, no
animation. A theme flip resamples the palette before the upload;
dirty flags gate the buffer writes so a steady frame is one
`drawArrays` and nothing else.

- `@param` host - the backdrop instance to draw
