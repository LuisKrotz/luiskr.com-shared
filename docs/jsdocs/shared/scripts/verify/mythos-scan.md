# `shared\scripts\verify\mythos-scan.mjs`

mythos-agent security gate — the Mythos equivalent of

|                |                                                         |
| -------------- | ------------------------------------------------------- |
| **Source**     | `src/shared\scripts\verify\mythos-scan.mjs`             |
| **UX surface** | Boot surfaces: what the user sees first on each bundle. |

## Members

### `PATH_DROP`

Generated/vendor paths — findings here are artifacts of the build or
third-party code, never first-party source. Mirrors .mythos.yml
scan.exclude plus the dirs only deterministic scanners can reach
(they carry hardcoded ignore lists that predate those excludes).

### `RULE_DROP`

Rules dropped outright — see header for justification.

### `RULE_REFINE`

Rule refinements — a finding survives only when its snippet matches the
security-relevant sub-pattern. Everything else is a scanner over-match.

### `loadExceptions`

`loadExceptions` — accepted risks from mythos-exceptions.json.

### `isExcepted`

`isExcepted` — rule + file match, line within a ±5 bucket when the
exception pins one (same tolerance mythos's own suppression keys use,
so small edits above a finding don't silently re-arm it).
