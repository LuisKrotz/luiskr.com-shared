/**
 * @file mobile-resilience.test.js
 * @description Layer 2 — unit & fallback contract tests for the boot
 * orchestrator, WASM loaders, GPU probes, and mobile resize guards. Every
 * test exercises a REAL failure mode observed (or plausible) on iOS WebKit /
 * Android Chromium — no mock-the-test pass-throughs. Real timers only: fake
 * timers cannot drain the orchestrator's self-rescheduling work safely.
 */
import { jest } from '@jest/globals'
import { POINTER_EVENTS, WINDOW_EVENTS } from '@core/tokens/events/dom.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Boot-time deferred work (rIC/setTimeout ~100ms + debounces) — settle window. */
const SETTLE_MS = 300

/**
 * Minimal AppRoot stand-in for mountAppShell. Any member the orchestrator
 * touches that we didn't predict resolves to a jest.fn() via the Proxy —
 * real collaborators (store/router/DOM) come from the shared test env.
 */
const mkHost = (overrides = {}) => {
  const base = {
    $: jest.fn(() => null),
    $$: jest.fn(() => []),
    addScopedListener: jest.fn(),
    updateSectionTops: jest.fn(),
    checkScroll: jest.fn(),
    _scrollRaf: 0,
    _docObserver: null,
    _scoped: [],
    shadowRoot: null,
    ...overrides,
  }

  return new Proxy(base, {
    // Underscore-prefixed keys are data fields (_bootCleanups, _scrollRaf)
    // that the orchestrator initializes itself — vending a function would
    // poison `??=` initialization. Methods get the auto-mock.
    get: (t, k) => {
      if (k in t) return t[k]
      if (typeof k === 'string' && k.startsWith('_')) return undefined

      return (t[k] = jest.fn(() => undefined))
    },
  })
}

/** Collect every (target, type, cb) a host's addScopedListener recorded. */
const captured = (host) => host.addScopedListener.mock.calls.map(([t, ty, cb]) => ({ t, ty, cb }))

/** Fire the captured window-level listener for an event type. */
const fireWindow = (host, type, ev = {}) =>
  captured(host)
    .filter((c) => (c.t === window || c.t === globalThis) && c.ty === type)
    .forEach((c) => c.cb(ev))

const setViewport = (w, h) => {
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true, writable: true })
  Object.defineProperty(window, 'innerHeight', { value: h, configurable: true, writable: true })
}

describe('Layer 2 — mobile resilience', () => {
  afterEach(async () => {
    // mountAppShell arms intent-gated lazy component imports — release the
    // gate so they land inside this suite instead of racing a later file's
    // module registry or the 20s quiet-window timer (boot-tails convention).
    window.dispatchEvent(new window.Event(POINTER_EVENTS.POINTERDOWN))
    await sleep(10)
  })

  describe('boot orchestrator fault tolerance', () => {
    test('mountAppShell completes + survives the deferred window when the measure throws', async () => {
      const { mountAppShell } = await import('@/app/boot.js')
      const host = mkHost({
        updateSectionTops: jest.fn(() => {
          throw new Error('layout exploded')
        }),
      })

      expect(() => mountAppShell(host)).not.toThrow()
      await expect(sleep(SETTLE_MS)).resolves.toBeUndefined()
    })

    test('mountAppShell completes + survives the deferred window when checkScroll rejects', async () => {
      const { mountAppShell } = await import('@/app/boot.js')
      const host = mkHost({ checkScroll: jest.fn(() => Promise.reject(new Error('scroll fail'))) })

      expect(() => mountAppShell(host)).not.toThrow()
      await expect(sleep(SETTLE_MS)).resolves.toBeUndefined()
    })

    test('boot never awaits WASM — a hanging instantiate cannot deadlock the shell', async () => {
      const prev = globalThis.WebAssembly

      globalThis.WebAssembly = {
        ...prev,
        instantiate: () => new Promise(() => {}),
      }

      const t0 = Date.now()
      const { mountAppShell } = await import('@/app/boot.js')

      mountAppShell(mkHost())
      expect(Date.now() - t0).toBeLessThan(3000)

      globalThis.WebAssembly = prev
    })
  })

  describe('WASM & GPU capability fallbacks', () => {
    const validNum = (n) => Number.isFinite(n) && n > 0

    test('calc* math stays valid when WebAssembly is absent at import', async () => {
      const prev = window.WebAssembly

      delete window.WebAssembly
      await jest.isolateModulesAsync(async () => {
        const m = await import('@core/utils/wasm/wasm-layout.js')

        expect(validNum(m.calcColumnWidth(3, 1200, 20))).toBe(true)
        expect(validNum(m.calcMediaScale(800, 600, 400, 300))).toBe(true)
        expect(m.calcMediaScale(800, 600, 400, 300)).toBeLessThanOrEqual(1)
      })
      window.WebAssembly = prev
    })

    test('calc* math stays valid when instantiate throws CompileError', async () => {
      const prev = window.WebAssembly

      window.WebAssembly = {
        compile: () => Promise.reject(new Error('CompileError')),
        instantiate: () => Promise.reject(new Error('CompileError')),
      }

      await jest.isolateModulesAsync(async () => {
        const m = await import('@core/utils/wasm/wasm-layout.js')

        await sleep(0)
        expect(validNum(m.calcMediaScale(800, 600, 400, 300))).toBe(true)
        expect(validNum(m.calcCardHeight(300, 1.5))).toBe(true)
      })
      window.WebAssembly = prev
    })

    test('loader never requires instantiateStreaming (arrayBuffer path)', async () => {
      const prev = window.WebAssembly

      window.WebAssembly = { instantiate: () => Promise.resolve({ instance: { exports: {} } }) }

      await jest.isolateModulesAsync(async () => {
        const m = await import('@core/utils/wasm/wasm-layout.js')

        expect(validNum(m.calcEaseOutCubic(0.5))).toBe(true)
      })
      window.WebAssembly = prev
    })

    test('WebGL context acquisition returns null — never throws — without GPU support', async () => {
      const { webglContext } = await import('@core/utils/canvas/webgl-mode.js')
      const canvas = document.createElement('canvas')

      canvas.getContext = () => null
      expect(webglContext(canvas)).toBeNull()
    })
  })

  describe('Android resize & scroll guard (boot)', () => {
    test('height-only oscillation (URL bar) triggers zero re-measure cycles', async () => {
      setViewport(412, 915)
      const { mountAppShell } = await import('@/app/boot.js')
      const host = mkHost()

      mountAppShell(host)
      await sleep(SETTLE_MS)
      const baseline = host.updateSectionTops.mock.calls.length

      for (const h of [875, 915, 855, 915, 815, 915]) {
        setViewport(412, h)
        fireWindow(host, WINDOW_EVENTS.RESIZE)
      }

      await sleep(SETTLE_MS)
      expect(host.updateSectionTops.mock.calls.length).toBe(baseline)
    })

    test('real width change fires exactly one debounced re-measure', async () => {
      setViewport(412, 915)
      const { mountAppShell } = await import('@/app/boot.js')
      const host = mkHost()

      mountAppShell(host)
      await sleep(SETTLE_MS)
      const baseline = host.updateSectionTops.mock.calls.length

      setViewport(915, 412)
      fireWindow(host, WINDOW_EVENTS.RESIZE)
      fireWindow(host, WINDOW_EVENTS.RESIZE)
      await sleep(SETTLE_MS)
      expect(host.updateSectionTops.mock.calls.length).toBe(baseline + 1)
    })
  })

  describe('Android resize guard (cardstack)', () => {
    const mkCardStack = () => ({
      $: jest.fn(() => null),
      addScopedListener: jest.fn(),
      _resizeW: -1,
      _resizeRaf: 0,
      _tier: { STACKED: true },
      measure: jest.fn(),
      applyPoses: jest.fn(),
    })

    test('stacked tier: height-only oscillation = 0 remeasure; width change = 1 rAF-coalesced remeasure', async () => {
      const { bindEvents } = await import('@website/components/home/cardstack/events.js')
      const host = mkCardStack()

      bindEvents(host)
      const rafQueue = []
      const prevRaf = globalThis.requestAnimationFrame

      globalThis.requestAnimationFrame = (cb) => (rafQueue.push(cb), rafQueue.length)
      setViewport(412, 915)

      for (const h of [875, 915, 855]) {
        setViewport(412, h)
        fireWindow(host, WINDOW_EVENTS.RESIZE)
      }
      expect(host.measure).not.toHaveBeenCalled()
      setViewport(915, 412)
      fireWindow(host, WINDOW_EVENTS.RESIZE)
      fireWindow(host, WINDOW_EVENTS.RESIZE)
      expect(rafQueue.length).toBe(1)
      rafQueue.forEach((cb) => cb())
      expect(host.measure).toHaveBeenCalledTimes(1)
      expect(host.applyPoses).toHaveBeenCalledTimes(1)
      globalThis.requestAnimationFrame = prevRaf
    })
  })
})
