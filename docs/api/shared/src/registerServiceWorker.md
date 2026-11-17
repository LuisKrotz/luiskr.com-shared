# `shared\src\registerServiceWorker.ts`

Registers the Workbox-generated service worker in production

|                |                                                         |
| -------------- | ------------------------------------------------------- |
| **Source**     | `src/shared\src\registerServiceWorker.ts`               |
| **UX surface** | Boot surfaces: what the user sees first on each bundle. |

## Members

### `reloadArmed`

One-shot reload gate — armed by an update install, disarmed on the
claim that fires it. Module-scoped: a reloaded page re-runs this
module fresh, so the flag resets for the next deploy cycle.

### `registerServiceWorker`

Registers `<base>service-worker.js` on window load when `env.PROD` is set.
Exported (and env-injected) so the prod-only branch is exercisable in
tests — `import.meta.env` does not exist outside Vite.

- `@param` {object} env - Vite env object ({PROD, BASE_URL})
