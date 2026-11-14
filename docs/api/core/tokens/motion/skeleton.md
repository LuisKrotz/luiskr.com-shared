# `core\tokens\motion\skeleton.ts`

Skeleton-shimmer configuration tokens — grouped subsets

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\tokens\motion\skeleton.ts`                      |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### `RESOLVE_DURATION`

Resolve-out length once content has arrived (ms)

### `SKELETON_MOSAIC`

Frozen skeleton map — sole declaration site for these tokens; consumers read members and
never re-declare the strings (zero-hardcoding rules 4–5). Object.freeze makes the token
contract immutable at runtime.

### `MOSAIC_TILES`

Mosaic skeleton tiles rendered before data lands (mirrors portfoliolist size)

### `MOSAIC_FEATURED`

The curated home list leads with featured (2-column) items

### `MOSAIC_LCP_TILES`

Mosaic tiles eligible for LCP — loaded eagerly with high fetch priority
