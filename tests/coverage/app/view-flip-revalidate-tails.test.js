/**
 * @file view-flip-revalidate-tails.test.js — coverage tail for
 * src/app/view.ts: the post-import outlet revalidation inside
 * flipAppView — a stale flip (a newer navigation landed mid-import)
 * must not mount, and an outlet whose live view already IS the target
 * (the shell's JSX seats <CurrentView> before the chunk upgrades) must
 * skip the swap instead of double-mounting the view.
 */
import { describe, test, expect, afterEach, jest } from '@jest/globals'
import { VIEW_TAGS } from '@core/tokens/elements/views.js'
import { HTML_TAGS } from '@core/tokens/elements/html.js'
import { ANIMATION_DURATIONS } from '@core/tokens/motion/animation.js'
import router from '@core/router/router.js'

const { flipAppView } = await import('@/app/view.js')

/** Route descriptor factory — only the fields flipAppView reads matter. */
const route = (view) => ({
  name: 'home',
  view,
  lang: 'en',
  path: '/',
  meta: {},
  params: {},
})

/** Generous flush — the crossfade's removal timer needs real time. */
const flush = (ms = 600) => new Promise((r) => setTimeout(r, ms))

const cleanups = []

afterEach(() => {
  while (cleanups.length) cleanups.pop()()

  router.currentRoute = null
})

describe('flipAppView post-import revalidation', () => {
  test('a stale flip aborts when currentViewTag moved to another view', async () => {
    // The route handler commits currentViewTag synchronously per
    // navigation — a getter simulates the mid-import supersede: the
    // first read (toTag capture) sees the flip's own target, the
    // post-import revalidation sees the newer intent.
    let reads = 0

    const c = {
      _sectionsMeasured: true,
      get currentViewTag() {
        reads++

        return reads === 1 ? VIEW_TAGS.VIEW_HOME : VIEW_TAGS.VIEW_PROJECT
      },
    }

    const outlet = document.createElement(HTML_TAGS.DIV)

    await flipAppView(c, outlet)

    // The import resolved but a newer flip owns the outlet — nothing mounts.
    expect(outlet.firstElementChild).toBeNull()
  })

  test('a live view that already is the target skips the swap and gets the route', async () => {
    // Pre-resolve the chunk so the rendered element upgrades in place —
    // the boot double-mount this guard exists to prevent.
    await import('@website/views/home/Home.js')

    const live = document.createElement(VIEW_TAGS.VIEW_HOME)
    const spy = jest.spyOn(live, 'onRouteParamChange').mockImplementation(() => {})

    cleanups.push(() => spy.mockRestore())

    const outlet = document.createElement(HTML_TAGS.DIV)

    outlet.appendChild(live)

    const c = { _sectionsMeasured: true, currentViewTag: VIEW_TAGS.VIEW_HOME }
    const to = route(VIEW_TAGS.VIEW_HOME)

    await flipAppView(c, outlet, to)

    // No second instance — the same element still owns the outlet and
    // received the route params the same-tag path would have delivered.
    expect(outlet.children.length).toBe(1)
    expect(outlet.firstElementChild).toBe(live)
    expect(spy).toHaveBeenCalledWith(to)

    // The fallback arm — no explicit `to` delivers router.currentRoute.
    router.currentRoute = null

    await flipAppView(c, outlet)

    expect(spy).toHaveBeenLastCalledWith(null)
  })

  test('a different live view still swaps through the crossfade', async () => {
    await import('@website/views/home/Home.js')

    const outlet = document.createElement(HTML_TAGS.DIV)
    const leaving = document.createElement(HTML_TAGS.DIV)

    outlet.appendChild(leaving)

    const c = { _sectionsMeasured: true, currentViewTag: VIEW_TAGS.VIEW_HOME }

    await flipAppView(c, outlet)

    // Tag mismatch — the swap proceeds: incoming mounts, outgoing fades.
    expect(outlet.children.length).toBe(2)
    expect(outlet.lastElementChild?.tagName.toLowerCase()).toBe(VIEW_TAGS.VIEW_HOME)

    await flush(ANIMATION_DURATIONS.PAGE_FADE_HALF + 100)

    expect(outlet.children.length).toBe(1)
    expect(outlet.firstElementChild?.tagName.toLowerCase()).toBe(VIEW_TAGS.VIEW_HOME)
  })

  test('an unupgraded element of an undefined tag does not satisfy the live check', async () => {
    const outlet = document.createElement(HTML_TAGS.DIV)
    const unupgraded = document.createElement('view-fake')

    outlet.appendChild(unupgraded)

    const c = { _sectionsMeasured: true, currentViewTag: 'view-fake' }

    await flipAppView(c, outlet)

    // customElements.get('view-fake') is empty — the guard fails and the
    // swap proceeds like any other outgoing view.
    expect(outlet.children.length).toBe(2)
  })

  test('an upgraded live view without onRouteParamChange still skips the swap', async () => {
    if (!customElements.get('view-fake-routeless')) {
      customElements.define('view-fake-routeless', class extends HTMLElement {})
    }

    const live = document.createElement('view-fake-routeless')
    const outlet = document.createElement(HTML_TAGS.DIV)

    outlet.appendChild(live)

    const c = { _sectionsMeasured: true, currentViewTag: 'view-fake-routeless' }

    await flipAppView(c, outlet)

    // The optional-call arm — no param handler, still no duplicate mount.
    expect(outlet.children.length).toBe(1)
    expect(outlet.firstElementChild).toBe(live)
  })

  test('a missing customElements registry falls through to the swap', async () => {
    await import('@website/views/home/Home.js')

    const live = document.createElement(VIEW_TAGS.VIEW_HOME)
    const outlet = document.createElement(HTML_TAGS.DIV)

    outlet.appendChild(live)

    const c = { _sectionsMeasured: true, currentViewTag: VIEW_TAGS.VIEW_HOME }
    const ce = globalThis.customElements

    delete globalThis.customElements

    try {
      await flipAppView(c, outlet)
    } finally {
      globalThis.customElements = ce
    }

    // The typeof guard short-circuits — the swap proceeds normally.
    expect(outlet.children.length).toBe(2)
  })
})
