# `shared\scripts\verify\skeleton-geometry.mjs`

Skeleton geometry gate — validates that the CSS-only

|                |                                                         |
| -------------- | ------------------------------------------------------- |
| **Source**     | `src/shared\scripts\verify\skeleton-geometry.mjs`       |
| **UX surface** | Boot surfaces: what the user sees first on each bundle. |

## Members

### `STRUCTURAL_SKELETON_CLASSES`

Structural skeleton markers — placeholders that fill a real layout
slot (media surface, host/overlay reserve, generic shimmer block on a
layout-classed element). Sized text/line variants (skeleton--para-_,
skeleton--title-_, skeleton-about-_, skeleton-footer-_, skeleton--badge)
approximate unknown copy and stay report-only.

### `VARIABLE_HEIGHT_LAYOUT_CLASSES`

Layout classes whose real box height is copy-driven: the stacked
card-stack tiers set the front card to height:auto and size the pile
from its live box (_frontExtra), so a skeleton card can only reserve
the ratio box — the exact height is unknowable before data. The
internal media slot is the same shape: the real <media-figure> height
is the cover's own aspect + its caption bar, both unknowable until
the project payload lands. Width stays a hard gate (it is pure layout
math); height is reported.

### `resolveChrome`

Chrome binary — same discovery the print/scroll gates use.

### `PORTFOLIO`

Project routes — the portfolio surface mirrors print-check's manifest.

### `DEFAULT_ROUTES`

Default route surface — every skeleton-emitting view: home (mosaic +
sections + card stack + mentions strip), the section routes, one legal
page, the animations catalog, and every portfolio project.

### `DEFAULT_VIEWPORTS`

Default validation viewports — one representative per width-class tier
(mobile / tablet / desktop / wide) since layout geometry is a function
of the tier class, not of every ladder width.

### `ALL_VIEWPORTS`

--all-bps: the full responsive registry (ladder widths, 900px tall).

### `customViewports`

Custom --bps=320,768,… override (widths only, 900px tall).

### `TOL`

Geometry tolerance for same-slot elements (px) — sub-pixel wiggle only.

### `SKELETON_WAIT`

How long to wait for skeletons to appear / real content to land (ms).

### `DATA_RE`

Request URLs whose resolution gates the skeleton→content swap:
the Firebase REST endpoints and the lazily imported per-locale boot
chunks (hashed `i18n-*` assets in the build, `i18n-boot` virtual ids in
dev). Holding these keeps every data-gated view in skeleton state.

### `routeSlug`

Route path → safe report directory name.

### `collectSkeletons`

Page-side composed-tree walk: collects every element whose class list
carries a `skeleton-` token, with its viewport-relative bounding box,
tag, full class string, and whether it also carries a non-skeleton
layout class (a same-slot stand-in vs a pure placeholder).

### `resolveReal`

Page-side twin resolution: walks the same composed tree the skeleton
capture walked, re-opens the shadow root the placeholder lived in, and
finds the real element that inherited its layout slot — by pose offset
for coverflow cards, else by nearest document-space centre among the
elements carrying the placeholder's layout classes.

### `until`

Polls a page-side predicate until true or the deadline passes.
