# `core\tokens\starfield\params.ts`

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\tokens\starfield\params.ts`                     |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### (module scope)

Star-field parameter barrel.

Engine parameters — camera rig, fly-to tween
timing, approach thresholds that trigger the lazy dossier fetch, and
the procedural material palette used for bodies without real imagery
(dwarf planets, exoplanets, stars, nebulae, galaxies). Sole declaration
site — consumers import members (zero-hardcoding rule). The parameter
bags are split across `./params/*.ts` by domain (camera/scale/bodies/
spiral/worker/catalog/scene); this module re-exports them all so
existing `@core/tokens/starfield/params.js` imports stay stable.

### `SF_PARAMS`

The complete parameter surface in one frozen flat map — every `SF_*`
bag member keyed by name, for consumers (devtools dumps, registries)
that iterate the whole parameter set instead of importing members.
