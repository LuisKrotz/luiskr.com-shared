/**
 * @file bundle-safety.test.js
 * @description Layer 1 — post-build bundle safety gate. Inspects the compiled
 * dist/ output for iOS-incompatible syntax, WASM asset integrity, and hosting
 * headers/rewrites that must never serve HTML fallbacks for binary assets.
 * Runs inside the shared module suite; requires `dist/` on disk (yarn build
 * first — enforced when TEST_MOBILE=1 so test:mobile cannot silently pass on
 * a stale tree).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Absolute repo root (shared/tests/build/../../..). */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const DIST = path.join(REPO_ROOT, 'dist')
const REQUIRE_DIST = process.env.TEST_MOBILE === '1'
const hasDist = fs.existsSync(DIST)

/** @yields Every file path under dir, recursively. */
function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)

    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}

/** Full dist listing — walked ONCE (the tree holds ~80k prerendered docs). */
const ALL_FILES = hasDist ? [...walk(DIST)] : []

/** All dist files matching an extension ('' = every file). */
const distFiles = (ext = '') => ALL_FILES.filter((f) => f.endsWith(ext))

/** Fail when TEST_MOBILE demands a fresh dist and none exists; otherwise no-op. */
const requireDist = () => {
  if (!hasDist && REQUIRE_DIST)
    throw new Error('dist/ missing — run `yarn build` before test:mobile')
  if (!hasDist) return false

  return true
}

describe('Layer 1 — bundle safety (dist/)', () => {
  test('zero un-transpiled regex lookbehinds in compiled JS', () => {
    if (!requireDist()) return

    const offenders = []

    for (const f of distFiles('.js')) {
      const src = fs.readFileSync(f, 'utf8')

      if (src.includes('(?<=') || src.includes('(?<!')) offenders.push(path.relative(REPO_ROOT, f))
    }

    expect(offenders).toEqual([])
  })

  test('every .wasm asset exists, is non-empty, and has valid magic bytes', () => {
    if (!requireDist()) return

    const wasms = distFiles('.wasm')

    expect(wasms.length).toBeGreaterThan(0)

    for (const f of wasms) {
      const buf = fs.readFileSync(f)

      expect(buf.length).toBeGreaterThan(8)
      expect([buf[0], buf[1], buf[2], buf[3]]).toEqual([0x00, 0x61, 0x73, 0x6d])
    }
  })

  test('wasm paths referenced from JS/HTML resolve to real dist files', () => {
    if (!requireDist()) return

    const missing = []
    // Quoted string literals only — unquoted `.wasm` matches are minified
    // property names (t.wasm), not asset paths.
    const refRe = /["'`]([\w./-]+\.wasm)["'`]/g
    const present = new Set(distFiles('.wasm').map((f) => path.basename(f)))
    const isAssetName = (b) => /^[\w-]{3,}\.wasm$/.test(b)

    for (const f of distFiles('.js').filter((p) => p.includes(`${path.sep}v${path.sep}`))) {
      for (const m of fs.readFileSync(f, 'utf8').matchAll(refRe)) {
        const base = path.basename(m[1])

        if (isAssetName(base) && !present.has(base))
          missing.push(`${path.relative(REPO_ROOT, f)} -> ${m[1]}`)
      }
    }

    expect(missing).toEqual([])
  })

  test('index.html never embeds raw wasm bytes', () => {
    if (!requireDist()) return

    for (const f of distFiles('.html')) {
      const head = fs.readFileSync(f).subarray(0, 4)

      expect([head[0], head[1], head[2], head[3]]).not.toEqual([0x00, 0x61, 0x73, 0x6d])
    }
  })

  test('firebase hosting serves .wasm as application/wasm, never HTML fallback', () => {
    const firebase = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'firebase.json'), 'utf8'))
    const headers = firebase.hosting?.headers ?? []
    const wasmEntry = headers.find(
      (h) =>
        typeof h.source === 'string' &&
        h.source.includes('wasm') &&
        (h.headers ?? []).some((kv) => kv.key === 'Content-Type' && kv.value === 'application/wasm')
    )

    expect(wasmEntry).toBeTruthy()

    const rewrites = firebase.hosting?.rewrites ?? []
    const assetHijack = rewrites.filter(
      (r) => typeof r.source === 'string' && /\.(wasm|js)\b/.test(r.source)
    )

    expect(assetHijack).toEqual([])
  })
})
