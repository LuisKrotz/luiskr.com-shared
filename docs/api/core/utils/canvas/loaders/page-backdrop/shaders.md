# `core\utils\canvas\loaders\page-backdrop\shaders.ts`

GLSL sources for PageBackdropWebGL — the grained lobe

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\utils\canvas\loaders\page-backdrop\shaders.ts`  |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### `PAGE_BACKDROP_VS`

Shared fullscreen-quad vertex shader.

### `PAGE_BACKDROP_COLOR_SLOTS`

Number of field hue slots in `u_col` — matches FIELD_CSS_PROP_LIST.

### `PAGE_BACKDROP_FS`

Lobe-field fragment shader — a STATIC pose: every lobe sits at its
authored centre, no time uniform, no drift, no pulse.

Coordinates: `uv` is 0..1 across the canvas with y DOWN (CSS
convention) because every lobe centre/radius below was authored as a
CSS `radial-gradient(ellipse W H at X Y)` on a full-viewport layer;
the constants are those values mapped into viewport space
(`c·1.5 − 0.25`, `r·1.5·0.85` of the former 150% layer) so the GL
field matches the approved CSS composition pixel-for-pixel in layout,
minus the banding.

Falloff: `k = 1 − d²` (d = normalized elliptical distance) is C¹ at
the rim; raising it to the 8th power zeroes slope and curvature there
(the field is C² everywhere — no derivative break exists for a Mach
band to form on) AND reproduces the authored CSS taper: relative
alpha ≈ 0.79 / 0.37 / 0.14 / 0.05 at d = 0.17 / 0.34 / 0.47 / 0.56
against the CSS stops' 0.62 / 0.34 / 0.21 / 0.10 — same visual weight,
continuous derivative.

Key light: a specular pool parked off the RIGHT edge (u_key, white in
both themes) at authored strength — the static studio light. The
counter-shade (u_shade, the ink pole) pools the lower-left, so the
field carries the same key-lit composition as the fallback ramps —
in float.

Grain: a sine-free per-pixel hash (Hoskins hash13) — uniform white
noise with no spatial lattice, so the grain reads as film speckle and
can never stripe the way a regular dither matrix (IGN, Bayer) does
on a near-black field. Two decorrelated taps sum to a triangular
distribution — soft grain, no salt-and-pepper extremes — with a fixed
seed so the static frame is deterministic pixel-for-pixel. Amplitude
is PAGE_BACKDROP.GRAIN_LSB plus a luminance-proportional lift
(GRAIN_LUM_LSB): the triangular tail clears the ±1 LSB TPDF floor
that dithers every 8-bit boundary, and the luminance term keeps the
speckle equally visible on the bright paper field — very fine stock
grain on both themes, never lines.
