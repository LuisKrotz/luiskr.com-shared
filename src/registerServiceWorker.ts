/**
 * @file registerServiceWorker.js
 * @description Registers the Workbox-generated service worker in production
 * only. Lifecycle hooks log status; an available update triggers a hard
 * reload so users never run a stale app shell behind new assets.
 */

import { TYPE_STRINGS } from '@core/tokens/strings/types.js'
import { WINDOW_EVENTS } from '@core/tokens/events/dom.js'
import { devError, devInfo } from '@core/devlog.js'
import {
  dropStaleServiceWorkers,
  isLocalhost,
  registerSiteServiceWorker,
} from '@core/utils/service-worker.js'

/**
 * Registers `<base>service-worker.js` on window load when `env.PROD` is set.
 * Exported (and env-injected) so the prod-only branch is exercisable in
 * tests — `import.meta.env` does not exist outside Vite.
 * @param {object} env - Vite env object ({PROD, BASE_URL})
 */
/** One-shot reload gate — armed by an update install, disarmed on the
 * claim that fires it. Module-scoped: a reloaded page re-runs this
 * module fresh, so the flag resets for the next deploy cycle. */
let reloadArmed = false

export const registerServiceWorker = (env: { PROD?: boolean; BASE_URL?: string }): void => {
  if (!env?.PROD || isLocalhost()) {
    // Non-prod builds and LOCAL origins actively UNregister — a stale
    // worker keeps replaying its old precache: on dev that is old chunks
    // against moved source, and on `vite preview` it is a whole previous
    // build's shell served against a rebuilt dist (hashed chunks gone).
    // Skipping registration keeps preview behavior identical to dev.
    dropStaleServiceWorkers()

    return
  }

  // Deferred to window.load — registration fetches + caches must never
  // compete with the critical request graph during first paint.
  window.addEventListener(WINDOW_EVENTS.LOAD, () => {
    void registerSiteServiceWorker(`${env.BASE_URL}service-worker.js`, {
      // First activation completes — the page is now cache-served.
      ready() {
        devInfo(
          'App is being served from cache by a service worker.\n' +
            'For more details, visit https://goo.gl/AFskqB'
        )
      },

      // Registration succeeded (pre-activation).
      registered() {
        devInfo('Service worker has been registered.')
      },

      // Precache payload finished writing.
      cached() {
        devInfo('Content has been cached for offline use.')
      },

      // A new SW version was found and is downloading its assets.
      updatefound() {
        devInfo('New content is downloading.')
      },

      // The new SW installed while a controller was live — an UPDATE,
      // not the first precache fill. Arm the reload; it fires on
      // controllerchange (the swap claim) so the page reloads exactly
      // when old shell + new assets are consistent, never mid-install.
      updated() {
        devInfo('New content is available; refreshing when claimed.')

        reloadArmed = true
      },

      // The new worker claimed this client — its precache now backs
      // every fetch, so reloading lands on the consistent new build.
      // Guarded by `updated`: the FIRST install's claim is disarmed —
      // a first-visit precache must never bounce the page.
      controllerchange() {
        if (!reloadArmed) return

        reloadArmed = false

        window.location.reload()
      },

      // Connectivity dropped — informational only; the cache keeps
      // the site functional.
      offline() {
        devInfo('No internet connection found. App is running in offline mode.')
      },

      // Registration/install threw — logged, never fatal (the site
      // works online without a SW).
      error(error) {
        devError('Error during service worker registration:', error)
      },
    })
  })
}

// `import.meta.env` only exists under Vite — guard so tests/other loaders can
// import this module without a build-time env shim.
const env = (typeof import.meta !== TYPE_STRINGS.UNDEFINED && import.meta.env) || {}

registerServiceWorker(env)
