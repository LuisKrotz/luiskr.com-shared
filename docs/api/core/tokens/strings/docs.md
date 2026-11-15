# `core\tokens\strings\docs.ts`

Docs-portal string tokens — English-only UI literals, the

|                |                                                           |
| -------------- | --------------------------------------------------------- |
| **Source**     | `src/core\tokens\strings\docs.ts`                         |
| **UX surface** | Shared primitives every surface builds on — no direct UI. |

## Members

### `DOCS_STRINGS`

Frozen docs string map — sole declaration site for these tokens;
consumers read members and never re-declare the strings
(zero-hardcoding rules 4–5). Object.freeze makes the token contract
immutable at runtime.

### `TITLE`

Page + footer link title — English-only by product spec.

### `DESC_FALLBACK`

English fallback for the CMS-provided description + toast copy.

### `SEARCH_GROUP_LABEL`

Route-search group header for docs hits — English-only by product
spec: the docs corpus exists only in English, so the label names
that explicitly in every locale (never localized, never CMS-fed).

### `CMS_COMPONENT`

database.json component node: translations/<locale>/components/<key>.

### `ASSET_BASE`

URL prefix under which rendered file payloads are served/emitted.

### `ASSET_EXT`

JSON suffix appended to every emitted content payload.

### `CRUMB_INPUT_LABEL`

Accessibility labels for the editable breadcrumb + copy feedback.

### `MAIN_LABEL`

aria-label on the docs content area — the shell already owns the
sole <main> landmark, so the portal's content region is a named
section (region landmark) rather than a second main.

### `KEY_PRINT_SCREEN`

Keyboard key the print-screen guard reacts to.

### `CRUMB_PLACEHOLDER`

Editable-breadcrumb input fallback when the URL path can't resolve.

### `CRUMB_INPUT_NAME`

`name` attr for the editable-breadcrumb field (form-field audit).

### `SRC_ROOT`

Root-bucket folder exempt from index-file auto-open (source tree).

### `INDEX_FILE`

Index filename that auto-opens when its folder is entered.

### `EVENT_COPY_ATTEMPT`

Analytics event name for copy-guard attempts.

### `SCHEMA_DESCRIPTION`

JSON-LD description for the portal root/folder pages.

### `LOADER_TITLE`

Boot-loader overlay copy — mirrors the space playground's system
boot sequence with docs-context wording (English-only portal).

### `MERMAID_LOADING`

In-place skeleton label while a mermaid diagram renders.

### `INDEX_TITLE`

sr-only heading + landmark names for the complete document index —
every manifest node rendered as a heading link so AT heading-jump
and crawlers reach all docs without walking the tree.

### `VIEWER_HEADING_PREFIX`

Viewer heading shown when a file is open — labels the content region.

### `GROUP_DOCS_LABEL`

Portal section labels — the flat root buckets re-seat under four
disclosure groups in the treeview and sectioned portal grid.

### `GROUP_PATH_PREFIX`

Synthetic path prefix for the section-group rows — ids under it are
view-only (a section has no manifest path), so tree bookkeeping
('group/docs'…) can never collide with a real docs route.

### `ARCH_DIR`

The docs-root child promoted into its own Architecture section.

### `DOCS_LOADER_PCT`

Staged boot-loader progress marks — the manifest is inlined at build
time so real fetch percentages don't exist; discrete stage numbers
keep the bar honest (manifest scanned → file fetched
→ portal usable).

### `DOCS_UNITS`

Unit tokens used by docs layout/backdrop math.

### `GL_STRIP_TIME_SCALE`

gl-strip thread-field drift — 1/16 real-time so lines barely move

### `FOLDER_HASH_MOD`

deterministic folder-art hash modulus

### `INDEX_CHUNK`

semantic-index streaming — elements appended per idle slice (~a few
ms each, far under a frame budget), the rIC starvation bound per
slice, and the setTimeout fallback delay where rIC is absent

### `TREE_SHEET_CAP_CLOSED`

folder paper-stack caps — closed folders peek at most this many
page tops above the tab; open folders fan up to this many colored
sheets, so the pile stops growing before it walls off the glyph
