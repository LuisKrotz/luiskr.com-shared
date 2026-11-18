/**
 * @file app/view.ts
 * @description View outlet reconciliation for AppRoot — same-tag routes delegate to onRouteParamChange; new views lazy-import their chunk then cross-fade (instant under reduced motion).
 */

import { ANIMATION_DURATIONS } from '@core/tokens/motion/animation.js'
import { READER_CLASSES } from '@core/tokens/classes/reader.js'
import { STATE_CLASSES } from '@core/tokens/classes/state.js'
import { VIEW_TAGS } from '@core/tokens/elements/views.js'
import { APP_IDS } from '@core/tokens/ids/app.js'
import { TYPE_STRINGS } from '@core/tokens/strings/types.js'
import { devError } from '@core/devlog.js'
import { notifyLoadFailed } from '@core/utils/notify.js'
import store from '@core/store.js'
import router from '@core/router/router.js'
import type { RouteDescriptor } from '@core/router/router.js'
import type { RoutableView } from './types.js'
import type { AppRoot } from '../App.js'

/**
 * Route-change reconciliation for the view outlet: when the target view
 * tag equals the mounted one (and the element is actually defined), the
 * view is kept alive and told about the new route via onRouteParamChange —
 * project→project navigation must not tear down GL state. A tag change
 * delegates to _flipToView for the swap.
 * @param c The AppRoot element.
 * @param to Destination descriptor (falls back to router.currentRoute).
 * @param _from Origin descriptor — unused, kept for listener parity.
 */
export function updateAppViewContent(
  c: AppRoot,
  to?: RouteDescriptor,
  _from?: RouteDescriptor | null
): void {
  const outlet = c.$(`#${APP_IDS.VIEW_OUTLET}`)

  // No outlet yet (pre-render frame) — nothing to reconcile.
  if (!outlet) return

  // The live view is the LAST child — a mid-crossfade outlet still
  // carries the fading leavings ahead of the mounted incoming view, and
  // a same-tag param change must reach the surviving view, not a corpse.
  const current = outlet.lastElementChild

  const targetTag = c.currentViewTag.toLowerCase()

  // Same-tag reuse requires the element be actually UPGRADED — an
  // unupgraded tag match (chunk still fetching) has no
  // onRouteParamChange to delegate to, so it counts as a real swap.
  const isDefined =
    typeof customElements !== TYPE_STRINGS.UNDEFINED && !!customElements.get(c.currentViewTag)

  if (current && current.tagName.toLowerCase() === targetTag && isDefined) {
    const routable = current as RoutableView

    // Delegate instead of remount — same-tag navigations keep their
    // canvas/state alive (project→project must not tear down GL).
    if (typeof routable.onRouteParamChange === TYPE_STRINGS.FUNCTION) {
      routable.onRouteParamChange?.(to || router.currentRoute)
    }

    return
  }

  // Different tag (or unupgraded element) → full view swap.
  c._flipToView(outlet, to)
}

/**
 * Parks the prerendered reader article offscreen once a real view owns
 * the outlet. Until then it stays painted under the intro veil so its
 * content counts as early FCP/LCP. Idempotent — safe on every swap.
 */
const parkReaderArticle = (): void => {
  // Optional chain — no-JS/prerendered documents may lack the article.
  document
    .querySelector(`article.${READER_CLASSES.CONTENT}`)
    ?.classList.add(READER_CLASSES.OFFSCREEN)
}

/**
 * View swap: lazy-imports the target view's chunk (each import is in its
 * own branch so bundlers keep per-route code-splitting), then either
 * instant-replaces the outlet (reduced motion / empty outlet) or plays
 * the OVERLAPPING cross-fade — the incoming view mounts in flow beneath
 * the outgoing view, which lifts to an absolute overlay and fades on
 * top for PAGE_FADE_HALF before being removed. The overlap is the
 * no-void contract: the outlet never sits empty between the out-leg
 * and the incoming first paint, so the page background can never flash
 * through (the dark-mode black frame). `_sectionsMeasured` resets so
 * the new view's sections re-measure lazily. After the awaited import
 * the outlet is revalidated: a flip superseded mid-flight aborts, and
 * an outlet whose live child already IS the target (the shell's JSX
 * seats <CurrentView> before the chunk upgrades) receives the route
 * params and skips the swap — never a double mount.
 * @param c The AppRoot element.
 * @param outlet The #view-outlet element.
 * @param _to Destination descriptor — the tag is read from c.currentViewTag.
 */
export async function flipAppView(
  c: AppRoot,
  outlet: Element,
  _to?: RouteDescriptor
): Promise<void> {
  // New view = new section markers; re-measure lazily via checkScroll.
  c._sectionsMeasured = false

  // Reduced-motion users take the instant path — no cross-fade.
  const reduced = store.getters.getReducedMotion()

  // The incoming view's tag name (view-home, view-project, …).
  const toTag = c.currentViewTag

  try {
    if (toTag === VIEW_TAGS.VIEW_HOME) {
      await import('@website/views/home/Home.js')
    } else if (toTag === VIEW_TAGS.VIEW_LEGAL) {
      await import('@website/views/legal/Legal.js')
    } else if (toTag === VIEW_TAGS.VIEW_PROJECT) {
      await import('@website/views/project/Project.js')
    } else if (toTag === VIEW_TAGS.VIEW_NOT_FOUND) {
      await import('@website/views/not-found/NotFound.js')
    } else if (toTag === VIEW_TAGS.VIEW_SEARCH) {
      await import('@website/views/search/Search.js')
    } else if (toTag === VIEW_TAGS.VIEW_SPACE_PLAYGROUND) {
      await import('@earth/SpacePlayground.js')
    } else if (toTag === VIEW_TAGS.VIEW_STAR_FIELD) {
      await import('@star/StarField.js')
    } else if (toTag === VIEW_TAGS.VIEW_DOCS) {
      await import('@docs/Docs.js')
    } else if (toTag === VIEW_TAGS.VIEW_ANIMATIONS) {
      await import('@website/views/animations/Animations.js')
    } else if (toTag === VIEW_TAGS.VIEW_SITEMAP) {
      await import('@website/views/sitemap/Sitemap.js')
    }
  } catch (err) {
    // Chunk fetch failed (offline, stale deploy/SW): keep the current view
    // mounted — swapping in an undefined tag would render a blank void.
    devError('[view] view chunk import failed:', err)

    notifyLoadFailed()

    return
  }

  // The chunk fetch gave a render-mounted element time to upgrade: the
  // shell's JSX already seats <CurrentView> inside the outlet, so on first
  // boot the live view can BE the target by the time the import lands —
  // appending a second instance would double-mount it (two live decks,
  // two data waves, a self-crossfade: the load flicker).
  //
  // A newer navigation may also have superseded this flip mid-flight:
  // currentViewTag is committed synchronously by the route handler
  // before each flip starts, so a value that no longer matches toTag
  // means a fresher flip owns the outlet — this one must not mount.
  if (c.currentViewTag !== toTag) return

  const live = outlet.lastElementChild as RoutableView | null

  if (
    live &&
    live.tagName.toLowerCase() === toTag.toLowerCase() &&
    typeof customElements !== TYPE_STRINGS.UNDEFINED &&
    customElements.get(toTag)
  ) {
    // Already the target — the upgrade finished in place during the
    // import; deliver the route params the same-tag path would have and
    // skip the swap entirely.
    live.onRouteParamChange?.(_to || router.currentRoute)

    parkReaderArticle()

    return
  }

  if (reduced || !outlet.firstElementChild) {
    // Instant swap — reduced motion, or an empty outlet (first mount)
    // where there is nothing to fade out from.
    outlet.replaceChildren(document.createElement(toTag))

    parkReaderArticle()

    return
  }

  // Every existing child leaves — a rapid second nav mid-crossfade can
  // stack an older outgoing AND a still-revealing incoming, and both
  // must fade out under the newest mount (the leaked-sibling fix).
  const leaving = Array.from(outlet.children)

  leaving.forEach((el) => el.classList.add(STATE_CLASSES.PAGE_FADE_OUT))

  // The incoming view mounts in flow IMMEDIATELY — fully laid out and
  // painted underneath before the outgoing's opacity drops, so the
  // reveal is the fade itself and no empty-outlet frame can paint.
  const incoming = document.createElement(toTag)

  outlet.appendChild(incoming)

  parkReaderArticle()

  setTimeout(() => {
    // Fade complete — the absolute overlays leave; the incoming view
    // owns the outlet's flow alone.
    leaving.forEach((el) => el.remove())
  }, ANIMATION_DURATIONS.PAGE_FADE_HALF)
}
