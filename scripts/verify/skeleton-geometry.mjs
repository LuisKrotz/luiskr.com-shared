/**
 * @file scripts/verify/skeleton-geometry.mjs
 * @description Skeleton geometry gate — validates that the CSS-only
 * `.skeleton-*` placeholders mirror the real layout they stand in for,
 * at every validation breakpoint.
 *
 * Per route × viewport the harness:
 *   1. holds the data layer open (Firebase REST + the i18n boot chunks
 *      are intercepted and parked) so the route stays in its skeleton
 *      state deterministically — no races, no timing guesses;
 *   2. walks the composed tree (shadow roots included) and records every
 *      skeleton element's bounding box;
 *   3. releases the held requests, waits for the placeholders to swap to
 *      real content, and resolves each placeholder's same-shadow-root
 *      twin — the real element carrying the same layout classes (for the
 *      coverflow fan, the article at the same pose offset);
 *   4. diffs skeleton box vs real box: placeholders that share a real
 *      layout class (media slots, text slots, carousel strips) must land
 *      inside tolerance; skeleton-only stand-ins (title/paragraph shim
 *      rows) are reported but not gated — copy length is unknowable at
 *      skeleton time, so their boxes are approximations by design.
 *
 * Screenshots land under reports/skeleton/<route>/<viewport>-{skeleton,loaded}.png
 * so a human can eyeball the shim against the real page side by side.
 *
 * Usage:
 *   node shared/scripts/verify/skeleton-geometry.mjs                 — dist build via vite preview
 *   node shared/scripts/verify/skeleton-geometry.mjs --base=http://localhost:5199
 *   node shared/scripts/verify/skeleton-geometry.mjs --routes=/,/portfolio/dell
 *   node shared/scripts/verify/skeleton-geometry.mjs --all-bps       — full BREAKPOINTS registry
 *   node shared/scripts/verify/skeleton-geometry.mjs --keep-server
 */

import { execFileSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

import { BREAKPOINTS } from '../../../core/tokens/layout/breakpoints.ts'
import { SKELETON_RESOLVE } from '../../../core/tokens/motion/skeleton.ts'
import { SKELETON_SELECTORS } from '../../../core/tokens/selectors/skeleton.ts'
import { SKELETON_CLASSES } from '../../../core/tokens/classes/skeleton.ts'
import { CARD_STACK_CLASSES } from '../../../core/tokens/classes/card-stack.ts'
import { INTERNAL_CLASSES } from '../../../core/tokens/classes/project.ts'

/**
 * Structural skeleton markers — placeholders that fill a real layout
 * slot (media surface, host/overlay reserve, generic shimmer block on a
 * layout-classed element). Sized text/line variants (skeleton--para-*,
 * skeleton--title-*, skeleton-about-*, skeleton-footer-*, skeleton--badge)
 * approximate unknown copy and stay report-only.
 */
const STRUCTURAL_SKELETON_CLASSES = [
  SKELETON_CLASSES.SKELETON_SHIMMER,
  SKELETON_CLASSES.SKELETON_MEDIA,
  SKELETON_CLASSES.SKELETON_HOST,
  SKELETON_CLASSES.SKELETON_OVERLAY,
  `${SKELETON_CLASSES.SKELETON}-cover`,
  `${SKELETON_CLASSES.SKELETON}-placeholder`,
]

/**
 * Layout classes whose real box height is copy-driven: the stacked
 * card-stack tiers set the front card to height:auto and size the pile
 * from its live box (_frontExtra), so a skeleton card can only reserve
 * the ratio box — the exact height is unknowable before data. The
 * internal media slot is the same shape: the real <media-figure> height
 * is the cover's own aspect + its caption bar, both unknowable until
 * the project payload lands. Width stays a hard gate (it is pure layout
 * math); height is reported.
 */
const VARIABLE_HEIGHT_LAYOUT_CLASSES = new Set([
  CARD_STACK_CLASSES.CARD_STACK_CARD,
  INTERNAL_CLASSES.INTERNAL_MAIN_ITEM,
])

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../..'
)
const REPORT_DIR = path.join(ROOT, 'reports')
const SHOT_DIR = path.join(REPORT_DIR, 'skeleton')
const SUMMARY_FILE = path.join(REPORT_DIR, 'skeleton-geometry.json')

const arg = (name, dflt) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))

  return hit ? hit.slice(name.length + 3) : dflt
}

const has = (name) => process.argv.includes(`--${name}`)

/** Chrome binary — same discovery the print/scroll gates use. */
const resolveChrome = () => {
  const env =
    process.env.SKEL_CHROME ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.PRINT_CHECK_CHROME ||
    process.env.SCROLL_FPS_CHROME

  if (env && fs.existsSync(env)) return env

  const cache = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome')

  if (fs.existsSync(cache)) {
    for (const ver of fs.readdirSync(cache).sort().reverse()) {
      for (const sub of ['chrome-win64', 'chrome-linux64']) {
        const exe = path.join(cache, ver, sub, sub === 'chrome-win64' ? 'chrome.exe' : 'chrome')

        if (fs.existsSync(exe)) return exe
      }
    }
  }

  for (const cand of [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ]) {
    if (fs.existsSync(cand)) return cand
  }

  for (const bin of ['google-chrome', 'chromium', 'chromium-browser']) {
    try {
      return execFileSync('which', [bin], { encoding: 'utf-8' }).trim()
    } catch {
      // not installed under this name — try the next
    }
  }

  throw new Error('skeleton-geometry: no Chrome binary found — set SKEL_CHROME')
}

/** Project routes — the portfolio surface mirrors print-check's manifest. */
const PORTFOLIO = [
  'aboutmarco',
  'brazilian-leather',
  'cecerele',
  'cicb',
  'clinica-de-desenvolvimento-nathalia-bond',
  'coza',
  'dell-design-system',
  'genesysinf-sageweb',
  'melissa',
  'metcha',
  'mini-melissa',
  'minimelissa',
  'mor',
  'nathalia-bond',
  'sage',
  'transa',
  'vibra',
]

/**
 * Default route surface — every skeleton-emitting view: home (mosaic +
 * sections + card stack + mentions strip), the section routes, one legal
 * page, the animations catalog, and every portfolio project.
 */
const DEFAULT_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/animations',
  ...PORTFOLIO.map((slug) => `/portfolio/${slug}`),
]

/**
 * Default validation viewports — one representative per width-class tier
 * (mobile / tablet / desktop / wide) since layout geometry is a function
 * of the tier class, not of every ladder width.
 */
const DEFAULT_VIEWPORTS = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide', width: 2560, height: 1440 },
]

/** --all-bps: the full responsive registry (ladder widths, 900px tall). */
const ALL_VIEWPORTS = Object.values(BREAKPOINTS).map((w) => ({
  name: `w${w}`,
  width: w,
  height: 900,
}))

/** Custom --bps=320,768,… override (widths only, 900px tall). */
const customViewports = () =>
  arg('bps', '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((w) => ({ name: `w${w}`, width: w, height: 900 }))

// Git Bash rewrites a leading `/` into `C:/Program Files/Git/` (MSYS path
// conversion) — map it back before the route list is used.
const MSYS_PREFIX = /^[A-Za-z]:[\\/]+Program Files[\\/]+Git/i

const ROUTES = arg('routes', '')
  ? arg('routes')
      .split(',')
      .map((r) => r.trim().replace(MSYS_PREFIX, ''))
      .map((r) => (r.startsWith('/') ? r : `/${r}`))
  : DEFAULT_ROUTES

const VIEWPORTS = has('all-bps')
  ? ALL_VIEWPORTS
  : arg('bps', '')
    ? customViewports()
    : DEFAULT_VIEWPORTS

const BASE = arg('base', `http://localhost:${Number(process.env.SKEL_PORT || 4173)}`)

/** Geometry tolerance for same-slot elements (px) — sub-pixel wiggle only. */
const TOL = Number(arg('tol', '2'))

/** How long to wait for skeletons to appear / real content to land (ms). */
const SKELETON_WAIT = Number(arg('skeleton-wait', '12000'))
const LOADED_WAIT = Number(arg('loaded-wait', '45000'))

/**
 * Request URLs whose resolution gates the skeleton→content swap:
 * the Firebase REST endpoints and the lazily imported per-locale boot
 * chunks (hashed `i18n-*` assets in the build, `i18n-boot` virtual ids in
 * dev). Holding these keeps every data-gated view in skeleton state.
 */
const DATA_RE =
  /firebaseio\.com|firebasedatabase\.app|i18n-[^/]*-(?:core|projects)|i18n-boot\/[^/]+\/(?:core|projects)/

/** Route path → safe report directory name. */
const routeSlug = (route) =>
  route === '/' ? 'home' : route.replace(/^\/+|\/+$/g, '').replace(/[^\w-]+/g, '_')

/**
 * Page-side composed-tree walk: collects every element whose class list
 * carries a `skeleton-` token, with its viewport-relative bounding box,
 * tag, full class string, and whether it also carries a non-skeleton
 * layout class (a same-slot stand-in vs a pure placeholder).
 */
const collectSkeletons = (selector, structural) => {
  const out = []
  const structuralSet = new Set(structural)

  // Shadow-root path of an element: tag#index chain of the host chain —
  // stable between the skeleton and loaded renders of the same view.
  const rootPath = (el) => {
    const parts = []
    let cur = el

    for (;;) {
      const root = cur.getRootNode()

      if (root === document || !root.host) break

      const host = root.host
      const sibs = host.parentNode ? Array.from(host.parentNode.children) : []

      parts.unshift(`${host.tagName.toLowerCase()}#${sibs.indexOf(host)}`)
      cur = host
    }

    return parts.join('>')
  }

  const ordinals = new Map()

  const visit = (root) => {
    const els = root.querySelectorAll(selector)

    for (const el of els) {
      const r = el.getBoundingClientRect()
      const cls = typeof el.className === 'string' ? el.className : ''
      const parts = cls.split(/\s+/).filter(Boolean)
      const skelClasses = parts.filter((c) => c.startsWith('skeleton'))
      const layoutClasses = parts.filter((c) => c && !c.startsWith('skeleton'))

      // A same-slot stand-in carries a real layout class AND only
      // structural skeleton markers; a shim that also carries a sized
      // text variant (para/title/footer/badge) approximates copy whose
      // box is unknowable before data — reported, not gated.
      const structuralOnly = skelClasses.every((c) => structuralSet.has(c))
      const rp = rootPath(el)
      const key = `${rp}|${layoutClasses.join(' ')}`
      const ordinal = ordinals.get(key) || 0

      ordinals.set(key, ordinal + 1)

      out.push({
        tag: el.tagName.toLowerCase(),
        cls,
        slot: layoutClasses.length > 0 && structuralOnly,
        layoutCls: layoutClasses.join(' '),
        skelCls: skelClasses.join(' '),
        rootPath: rp,
        ordinal,
        // Authored box (inline style) — comparable across transforms for
        // rotated/fanned elements whose bounding rect is projection, not
        // layout.
        styleW: parseFloat(el.style.width) || null,
        styleH: parseFloat(el.style.height) || null,
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        // Document-space center — geometry survives viewport scrolling.
        docX: r.x + window.scrollX + r.width / 2,
        docY: r.y + window.scrollY + r.height / 2,
      })
    }

    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) visit(el.shadowRoot)
    }
  }

  visit(document)

  // Total siblings per (root, layout-class set) — a coverflow fan emits a
  // symmetric offset band, so the centre ordinal is the front pose.
  for (const rec of out) {
    rec.siblingCount = ordinals.get(`${rec.rootPath}|${rec.layoutCls}`)
  }

  return out
}

/**
 * Page-side twin resolution: walks the same composed tree the skeleton
 * capture walked, re-opens the shadow root the placeholder lived in, and
 * finds the real element that inherited its layout slot — by pose offset
 * for coverflow cards, else by nearest document-space centre among the
 * elements carrying the placeholder's layout classes.
 */
const resolveReal = (rootPathWanted, docX, docY, layoutCls, ordinal, siblingCount, cardClass) => {
  // Map every root (document + shadow roots) to its host-chain path.
  const rootPaths = new Map()

  const visit = (root, p) => {
    rootPaths.set(p, root)

    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const sibs = el.parentNode ? Array.from(el.parentNode.children) : []

        visit(el.shadowRoot, `${p}${p ? '>' : ''}${el.tagName.toLowerCase()}#${sibs.indexOf(el)}`)
      }
    }
  }

  visit(document, '')

  const root = rootPaths.get(rootPathWanted)
  const wanted = (layoutCls || '').split(/\s+/).filter(Boolean)

  if (!root || !wanted.length) return null

  const clsOf = (e) => (typeof e.className === 'string' ? e.className : '')

  const hasAll = (e) => {
    const c = new Set(clsOf(e).split(/\s+/))

    return wanted.every((w) => c.has(w))
  }

  const isSkeleton = (e) =>
    clsOf(e)
      .split(/\s+/)
      .some((c) => c.startsWith('skeleton'))

  // Coverflow fan: the skeleton's ordinal stands for ring offset
  // s = ordinal − (count−1)/2 — its twin is the real article whose
  // data-index sits at that offset from the live front card. Nearest-
  // centre matching can't be used: the projected boxes of rotated pile
  // cards overlap and hide neighbours.
  if (wanted.includes(cardClass) && root.host && typeof root.host.activeIdx === 'number') {
    const host = root.host
    const len = (host.deckItems || []).length

    if (len) {
      const byIndex = new Map()

      for (const el of root.querySelectorAll('[data-index]')) {
        if (!hasAll(el) || isSkeleton(el)) continue

        byIndex.set(Number(el.getAttribute('data-index')), el)
      }

      const f = Math.round(host.activeIdx)
      const s = ordinal - (siblingCount - 1) / 2
      const idx = (((f + s) % len) + len) % len
      const twin = byIndex.get(idx)

      if (twin) {
        const r = twin.getBoundingClientRect()

        return {
          tag: twin.tagName.toLowerCase(),
          cls: clsOf(twin),
          x: r.x,
          y: r.y,
          w: r.width,
          h: r.height,
          styleW: parseFloat(twin.style.width) || null,
          styleH: parseFloat(twin.style.height) || null,
          centerDistance: 0,
          poseIndex: idx,
        }
      }
    }
  }

  // Candidate twins in document order — same root, same layout classes,
  // non-skeleton, and visible (folded conveyor slots collapse to ~0 box
  // and would poison the width check with a false mismatch).
  const candidates = []

  for (const el of root.querySelectorAll('*')) {
    if (!hasAll(el) || isSkeleton(el)) continue

    const r = el.getBoundingClientRect()

    if (r.width <= 4 || r.height <= 4) continue

    candidates.push({ el, r })
  }

  if (!candidates.length) return null

  // Primary pairing: same slot ordinal in document order — the skeleton
  // shim sequence mirrors the real slot sequence, so placeholder i maps
  // to real slot i. Nearest-center matching degenerates when sibling
  // boxes overlap (conveyor cards, fanned piles) and can pair several
  // shims with the same real element.
  let best = null
  let bestR = null
  let matchedBy = 'ordinal'

  if (ordinal != null && ordinal < candidates.length) {
    best = candidates[ordinal].el
    bestR = candidates[ordinal].r
  } else {
    let bestD = Infinity

    for (const { el, r } of candidates) {
      const cx = r.x + window.scrollX + r.width / 2
      const cy = r.y + window.scrollY + r.height / 2
      const d = Math.abs(cx - docX) + Math.abs(cy - docY)

      if (d < bestD) {
        bestD = d
        best = el
        bestR = r
      }
    }

    matchedBy = `nearest:${bestD.toFixed(2)}`
  }

  if (!best) return null

  return {
    tag: best.tagName.toLowerCase(),
    cls: clsOf(best),
    x: bestR.x,
    y: bestR.y,
    w: bestR.width,
    h: bestR.height,
    styleW: parseFloat(best.style.width) || null,
    styleH: parseFloat(best.style.height) || null,
    centerDistance: matchedBy,
  }
}

/** Polls a page-side predicate until true or the deadline passes. */
const until = async (page, fn, arg, timeoutMs, label) => {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (await page.evaluate(fn, arg)) return true

    await new Promise((r) => setTimeout(r, 120))
  }

  throw new Error(`skeleton-geometry: timed out waiting for ${label}`)
}

const main = async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true })

  let server = null

  if (!arg('base', '')) {
    server = spawn('yarn', ['vite', 'preview', '--port', String(new URL(BASE).port)], {
      stdio: ['ignore', 'pipe', 'inherit'],
    })

    const deadline = Date.now() + 30000

    for (;;) {
      try {
        const res = await fetch(BASE, { method: 'HEAD' })

        if (res.ok || res.status === 404) break
      } catch {
        if (Date.now() > deadline) {
          server.kill('SIGKILL')
          throw new Error('skeleton-geometry: vite preview did not start within 30s')
        }

        await new Promise((r) => setTimeout(r, 500))
      }
    }
  }

  const browser = await puppeteer.launch({
    executablePath: resolveChrome(),
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  const report = []
  let failures = 0

  try {
    for (const route of ROUTES) {
      const dir = path.join(SHOT_DIR, routeSlug(route))

      fs.mkdirSync(dir, { recursive: true })

      for (const vp of VIEWPORTS) {
        const page = await browser.newPage()

        await page.setViewport({ width: vp.width, height: vp.height })
        await page.setRequestInterception(true)

        const held = []

        page.on('request', (req) => {
          if (DATA_RE.test(req.url())) {
            held.push(req)
          } else {
            req.continue().catch(() => {})
          }
        })

        const entry = {
          route,
          viewport: `${vp.width}x${vp.height}`,
          skeletons: 0,
          slotChecks: [],
          standins: [],
          warnings: [],
          ok: true,
        }

        try {
          await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })

          await until(
            page,
            (sel) => {
              const visit = (root) => {
                let n = root.querySelectorAll(sel).length

                for (const el of root.querySelectorAll('*')) {
                  if (el.shadowRoot) n += visit(el.shadowRoot)
                }

                return n
              }

              return visit(document) > 0
            },
            SKELETON_SELECTORS.SKELETON_ANY,
            SKELETON_WAIT,
            `skeleton markup on ${route}`
          )

          // Let mount-time ResizeObserver corrections repaint the
          // placeholders (the card fan re-measures after the deck's real
          // rect lands) before geometry is captured.
          await new Promise((r) => setTimeout(r, 1200))

          const skeletons = await page.evaluate(
            collectSkeletons,
            SKELETON_SELECTORS.SKELETON_ANY,
            STRUCTURAL_SKELETON_CLASSES
          )

          entry.skeletons = skeletons.length

          await page.screenshot({
            path: path.join(dir, `${vp.name}-skeleton.png`),
            fullPage: false,
          })

          for (const req of held) await req.continue().catch(() => {})

          await page.setRequestInterception(false)

          await until(
            page,
            (sel) => {
              const visit = (root) => {
                let n = root.querySelectorAll(sel).length

                for (const el of root.querySelectorAll('*')) {
                  if (el.shadowRoot) n += visit(el.shadowRoot)
                }

                return n
              }

              return visit(document) === 0
            },
            SKELETON_SELECTORS.SKELETON_ANY,
            LOADED_WAIT,
            `content on ${route}`
          )

          // Let the content-in fade finish so measurements land on the
          // settled layout.
          await new Promise((r) => setTimeout(r, SKELETON_RESOLVE.RESOLVE_DURATION + 400))

          for (const sk of skeletons) {
            const real = sk.slot
              ? await page.evaluate(
                  resolveReal,
                  sk.rootPath,
                  sk.docX,
                  sk.docY,
                  sk.layoutCls,
                  sk.ordinal,
                  sk.siblingCount,
                  CARD_STACK_CLASSES.CARD_STACK_CARD
                )
              : null

            const delta = real
              ? {
                  dw: +(real.w - sk.w).toFixed(2),
                  dh: +(real.h - sk.h).toFixed(2),
                  dx: +(real.x - sk.x).toFixed(2),
                  dy: +(real.y - sk.y).toFixed(2),
                  dwStyle:
                    real.styleW != null && sk.styleW != null
                      ? +(real.styleW - sk.styleW).toFixed(2)
                      : null,
                  dhStyle:
                    real.styleH != null && sk.styleH != null
                      ? +(real.styleH - sk.styleH).toFixed(2)
                      : null,
                  centerDistance: real.centerDistance,
                  poseIndex: real.poseIndex,
                }
              : null

            const rec = { skeleton: sk, real, delta }

            if (!sk.slot) {
              // Pure placeholder rows (title/para shims) stand in for
              // content whose box is unknowable at skeleton time —
              // reported, not gated.
              entry.standins.push(rec)
            } else if (!real) {
              entry.ok = false
              entry.slotChecks.push(rec)
              entry.warnings.push(`no same-slot twin for ${sk.cls} @ ${sk.rootPath || 'document'}`)
            } else {
              // Positions legitimately drift when upstream sections
              // change height after content lands — the gated contract
              // is the element's own box. Width is pure layout math and
              // always gated; height is gated unless the layout class is
              // declared copy-sized (see VARIABLE_HEIGHT_LAYOUT_CLASSES).
              const skelLayout = new Set(sk.layoutCls.split(/\s+/).filter(Boolean))
              const heightGated = ![...skelLayout].some((c) =>
                VARIABLE_HEIGHT_LAYOUT_CLASSES.has(c)
              )
              // Transformed elements (the coverflow fan) project their
              // bounding rect — the authored inline box is the honest
              // comparison there.
              const dwMetric = delta.dwStyle != null ? delta.dwStyle : delta.dw
              const dhMetric = delta.dhStyle != null ? delta.dhStyle : delta.dh
              const bad = Math.abs(dwMetric) > TOL || (heightGated && Math.abs(dhMetric) > TOL)

              rec.heightGated = heightGated

              rec.ok = !bad

              if (bad) {
                entry.ok = false
                entry.warnings.push(
                  `slot mismatch ${sk.layoutCls}: Δw ${delta.dw} Δh ${delta.dh} Δx ${delta.dx} Δy ${delta.dy}`
                )
              }

              entry.slotChecks.push(rec)
            }
          }

          await page.screenshot({
            path: path.join(dir, `${vp.name}-loaded.png`),
            fullPage: false,
          })
        } catch (err) {
          entry.ok = false
          entry.warnings.push(String(err && err.message ? err.message : err))

          try {
            await page.screenshot({ path: path.join(dir, `${vp.name}-error.png`) })
          } catch {
            // page already gone — nothing to shoot
          }
        }

        if (!entry.ok) failures += 1

        report.push(entry)
        console.log(
          `  ${entry.ok ? '✓' : '✗'} ${route} @ ${vp.name}: ${entry.skeletons} skeletons, ` +
            `${entry.slotChecks.length} slot checks${entry.warnings.length ? ` — ${entry.warnings.join('; ')}` : ''}`
        )

        await page.close()
      }
    }
  } finally {
    await browser.close()

    if (server && !has('keep-server')) server.kill('SIGKILL')
  }

  fs.writeFileSync(SUMMARY_FILE, JSON.stringify({ base: BASE, tol: TOL, report }, null, 2))
  console.log(`\nReport: ${SUMMARY_FILE}`)
  console.log(`Shots:  ${SHOT_DIR}`)

  if (failures) {
    console.error(`skeleton-geometry: ${failures} route×viewport checks failed`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
