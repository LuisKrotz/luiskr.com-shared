/**
 * @file app-shell-coverage-approot-tails-3.test.js
 * @description Third slice of the "AppRoot tails" describe — see
 * app-shell-coverage-approot-tails.test.js for why the describe is
 * split (per-mount retained heap under happy-dom vs the 4GB worker
 * ceiling in the pooled module run).
 */
import { describe, test, expect, jest, beforeEach, afterEach, afterAll } from '@jest/globals'
import { AppRoot } from '@/App.js'
import store from '@core/store.js'
import router from '@core/router/router.js'
import { mount, TEST_TEXT } from '@tests/fixtures/test-constants.js'
import { VIEW_TAGS } from '@core/tokens/elements/views.js'
import { MODAL_MUTATIONS, UI_MUTATIONS } from '@core/tokens/events/mutations.js'
import { MODAL_CLASSES } from '@core/tokens/classes/modal.js'
import { APP_IDS } from '@core/tokens/ids/app.js'
import {
  DRAG_EVENTS,
  KEYBOARD_EVENTS,
  MOUSE_EVENTS,
  POINTER_EVENTS,
  TOUCH_EVENTS,
  WINDOW_EVENTS,
} from '@core/tokens/events/dom.js'
import { INPUT_STRINGS } from '@core/tokens/strings/input.js'
import { ATTR_VALUES } from '@core/tokens/attrs/values.js'
import { DATA_ATTRS } from '@core/tokens/attrs/data.js'

import { ROUTE_NAMES } from '@core/constants.js'

/** Timer flush — yields one macrotask so mounted element callbacks run. */
const flush = (ms = 0) => new Promise((r) => setTimeout(r, ms))

/** Mount cleanups registered per test — each returns the DOM to empty. */
let cleanups = []

beforeEach(() => {
  // Mounts read router.currentRoute.view — keep a complete descriptor.
  router.currentRoute = { name: ROUTE_NAMES.HOME, view: VIEW_TAGS.VIEW_HOME, meta: {} }
})

afterEach(() => {
  cleanups.forEach((c) => c())
  cleanups = []
})

afterAll(async () => {
  // Drain armed onUserIntent registrations — every booted shell holds a
  // 20s fallback timer whose lazy import()s must resolve while the jest
  // environment is still alive.
  window.dispatchEvent(new Event(KEYBOARD_EVENTS.KEYDOWN))
  await flush(300)
})

/**
 * Replaces global fetch with a resolved-null stub so route/data calls
 * inside component mounts never hit the network; returns the original
 * for restoration.
 */
const stableFetch = () => {
  const orig = globalThis.fetch

  globalThis.fetch = jest.fn(async () => ({ ok: true, json: async () => null }))

  return orig
}

// ─── AppRoot tails ──────────────────────────────────────────────────────────
describe('AppRoot tails', () => {
  const mountApp = async () => {
    const origFetch = stableFetch()
    const el = new AppRoot()
    cleanups.push(mount(el))

    await flush(80)

    return { el, origFetch }
  }

  test('disconnect cancels a pending coalesced scroll rAF', async () => {
    const { el, origFetch } = await mountApp()

    window.dispatchEvent(new Event(WINDOW_EVENTS.SCROLL))

    expect(el._scrollRaf).not.toBe(0)

    el.remove()

    expect(el._scrollRaf).toBe(0)

    globalThis.fetch = origFetch
  })

  test('modal open/close fallback arms: missing class, transform, main and auto top', async () => {
    const { el, origFetch } = await mountApp()
    const mainEl = el.shadowRoot.querySelector(`#${APP_IDS.MAIN_CONTENT}`)

    store.commit(MODAL_MUTATIONS.SET_MODAL, { open: true })
    el._updateModalState()
    expect(document.documentElement.classList.contains(MODAL_CLASSES.MODAL_OPEN)).toBe(true)

    mainEl.style.top = ATTR_VALUES.AUTO

    store.commit(MODAL_MUTATIONS.SET_MODAL, { open: false })
    el._updateModalState()

    mainEl.remove()

    store.commit(MODAL_MUTATIONS.SET_MODAL, { open: true, transform: 50 })
    el._updateModalState()

    store.commit(MODAL_MUTATIONS.SET_MODAL, { open: false })
    el._updateModalState()

    el.shadowRoot.querySelector(`[${DATA_ATTRS.DATA_APP_WRAPPER}]`).remove()
    el._updateModalState()

    globalThis.fetch = origFetch
  })

  test('input listeners cover pen, unknown, already-set and non-PointerEvent arms', async () => {
    const origFetch = stableFetch()
    const origPE = window.PointerEvent

    const el = new AppRoot()
    cleanups.push(mount(el))
    await flush(30)

    const pointer = (type) => {
      const e = new Event(POINTER_EVENTS.POINTERDOWN)
      Object.defineProperty(e, 'pointerType', { value: type })
      window.dispatchEvent(e)
    }

    pointer(INPUT_STRINGS.PEN)
    pointer(TEST_TEXT.UNKNOWN)

    store.commit(UI_MUTATIONS.SET_INPUT_METHOD, INPUT_STRINGS.TOUCH)
    pointer(INPUT_STRINGS.TOUCH)
    pointer(INPUT_STRINGS.MOUSE)
    pointer(INPUT_STRINGS.MOUSE)

    window.dispatchEvent(new Event(MOUSE_EVENTS.CONTEXTMENU))
    window.dispatchEvent(new Event(DRAG_EVENTS.DRAGSTART))

    delete window.PointerEvent

    const el2 = new AppRoot()
    cleanups.push(mount(el2))
    await flush(30)

    window.dispatchEvent(new Event(TOUCH_EVENTS.TOUCHSTART))
    window.dispatchEvent(new Event(MOUSE_EVENTS.MOUSEDOWN))

    window.PointerEvent = origPE

    globalThis.fetch = origFetch
  })
})
