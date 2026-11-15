# `experiments\docs\Docs.tsx`

&lt;view-docs&gt; — the English-only docs portal route.

|                |                                                         |
| -------------- | ------------------------------------------------------- |
| **Source**     | `src/experiments\docs\Docs.tsx`                         |
| **UX surface** | Boot surfaces: what the user sees first on each bundle. |

## Members

### `ViewDocs`

The ViewDocs — docs portal route element.

### `docsPath`

Current '/docs/<path>' suffix from the route param.

### `node`

Resolved manifest node for docsPath (null at the portal root).

### `filePayload`

Open file payload state.

### `fileLoading`

File fetch in flight.

### (module scope)

Dirs the treeview shows expanded.

### `navOpen`

Mobile nav-panel open state (the tree collapses under a toggle <1024).

### (module scope)

Path whose tree/grid button regains focus after the next re-render —
arrow-key expand/collapse re-creates the DOM, so focus would
otherwise drop to the body.

### (module scope)

The treeview's roving tab stop — path of the single tabindex="0"
row. APG trees take ONE tab stop: Tab enters the widget once,
arrows move inside it. Every other row carries tabindex="-1" so
keyboard users aren't forced through thousands of links.

### (module scope)

Document-level istanbul key-nav disposer while a report is open.

### (module scope)

`true` while the print mirror was created on demand (dev sessions
ship no prerendered `article.reader-content`) — the afterprint pass
removes it so no stray parked article outlives the print pass.

### `_docsReady`

Boot-loader lifecycle — the overlay stays up until the portal's first
usable state: manifest resolved and any in-flight file payload
settled. Mirrors the space playground's `_earthReady` contract.

### `_loaderMsg`

Current boot stage copy + percent rendered inside the loader.

### (module scope)

Section nodes parenting the manifest roots — memoized; the group
rows seed open so the grouped tree lands with its members visible
like the flat list it replaced.

### `rootsAsNodes`

Manifest roots grouped under the four section nodes for the
treeview and the portal-root grid.

### `generatedAt`

ISO generated stamp shown under the title.

### `isDirOpen`

Whether a dir path is expanded in the treeview.

### `treeTabIndex`

Roving tabindex for a rendered tree row — '0' only on the current
tab-stop path so the treeview exposes exactly one Tab entry per the
ARIA treeview pattern (IBM widget_tabbable_single).

- `@param` path Manifest path of the row being rendered.

### `treeFocusItem`

Focus landed on a tree row (arrow move, click-focus, or the
_focusPath restore): make it the widget's single tab stop by
flipping tabindex across the live rows — an attribute flip, not a
re-render, so focus never churns mid-gesture.

- `@param` path Manifest path of the focused row.

### `isProtectedView`

Whether the open file sits under a protected source-module root.

### (module scope)

Localized toast copy for the copy guard — componentText already English-falls-back.

### `navigateDocs`

Navigates within the portal — a bare path resolves against /docs.

- `@param` subPath Manifest-relative path ('' → portal root).

### `pickNode`

Grid/tree click — dirs toggle expansion AND navigate so the grid lands
on the folder; files navigate straight to their file route.
Section-group nodes have no route — they only toggle disclosure.

### `pickTreeNode`

Tree-row click — clicking an already-expanded dir collapses it (and,
when the viewer sits inside that folder, navigates back to its parent
so the page state matches the collapsed tree); a closed dir expands
and navigates; files navigate.

### `closeFile`

Back button — navigates to the file's parent folder (or the root).
A non-source index.html IS the folder's open state: its parent dir
re-opens it on entry (_applyPath), so back must climb past the
owning dir to the grandparent — otherwise the button loops on the
same file. Under source roots index.html is a plain file: one level.

### `toggleNav`

Mobile "browse" toggle — shows/hides the tree panel on small screens.

### `toggleDir`

Expands or collapses a dir in place (keyboard left/right) without navigating.

### (module scope)

Visible tree buttons in DOM order — the arrow-key cursor space for
the treeview pattern (only rendered rows exist, so collapsed
subtrees are naturally skipped).

### `onTreeKey`

ARIA treeview keys on the nav: ↑/↓ move between visible rows, → opens
a closed dir (or descends into an open one), ← closes an open dir (or
focuses the parent). The rows are anchors now — Enter activates
natively, Space is routed to a click since anchors don't activate on
Space like buttons do.

### `onGridKey`

Arrow-key roving on the folder grid — ←/→/↑/↓ step between cards in
DOM order (the grid's column count is layout-derived, so linear
traversal is the robust choice on every breakpoint).

### `onViewKey`

Host-level keys — Escape backs out of the open file (or closes the
mobile nav panel) without leaving the portal.

### `onCrumbKey`

Editable-breadcrumb commit — Enter navigates to the typed path,
Escape restores the input to the live path.

### `onRouteParamChange`

Same-tag navigation (file → sibling): resolves the new path without
tearing down GL/observability state.

### (module scope)

Lifecycle: store sub + path resolution + guards.

### (module scope)

The printable mirror — the prerendered `article.reader-content` in
production, created on demand in dev. A created mirror is flagged so
the unprepared pass removes the element instead of just emptying it.

### (module scope)

Returns the mirror to its unprepared state: a created (dev) article
leaves the DOM outright; a prerendered one drops the prepared marker
and its cloned content so the `:empty` rule parks it again and #app
prints the live view on the next pass.

### (module scope)

Print-prepare answer — the print adapter fires `printprepare` before
its media walk so the selected page's rendered form (mermaid SVG
diagrams, istanbul tables) lands in the reader mirror, which the
print sheet then treats as the document: `data-print-doc` marks it
authoritative and #app steps aside. With no page open the mirror is
left unprepared — the portal's light card grid prints instead.
Cloned canvases are dead buffers and get stripped — the live
canvases inject their own captured stills during the walk.

### (module scope)

Afterprint answer — unprepared the mirror so the next print (on any
view) never reads a stale docs document.

### (module scope)

Lifecycle: (re)mounts the GL strip and viewer content.

### `_updateLoader`

Mirrors a boot stage into the loader overlay (delegates to loader.ts).

### `_dismissLoader`

Fades + removes the loader overlay (delegates to loader.ts).

### (module scope)

Advances or dismisses the boot loader based on the just-rendered
state: a file fetch in flight reports the file stage and waits;
anything else means the portal is usable — mark ready, report the
final stage, and fade the overlay out. A failed payload fetch (null)
still counts as settled so the loader can never strand the page.

### (module scope)

Lifecycle: disposes guard + GL surfaces.

### (module scope)

Applies a docsPath: resolves the manifest node, auto-expands the
ancestor dirs in the treeview, syncs the page title + JSON-LD graph
(BreadcrumbList + TechArticle/CollectionPage), noindexes unresolved
paths, and kicks the lazy file fetch.

- `@param` docsPath Manifest-relative docs path.

### (module scope)

Lazy file payload fetch → state → innerHTML paint in onUpdated.

### (module scope)

Paints the open payload — media data-URL for images, rendered HTML
for everything else (markdown, JSON trees, sanitized html reports,
code blocks). innerHTML (not the JSX sanitizer) because payloads are
build-time generated markup that needs <pre>/<table>/<style> intact.

### (module scope)

Intercepts anchor clicks inside painted payload HTML — relative links
inside reports (istanbul `../index.html`, sibling file pages) resolve
against the current /docs route and stay inside the SPA; hash and
external links pass through untouched.

### (module scope)

JSX template — lives in render.tsx.
