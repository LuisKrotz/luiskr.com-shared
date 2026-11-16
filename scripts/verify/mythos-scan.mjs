#!/usr/bin/env node
/**
 * @file mythos-scan.mjs
 * @description mythos-agent security gate — the Mythos equivalent of
 * security-scan.mjs (yarn audit/Snyk). Runs the deterministic + pattern
 * scanners programmatically, then applies three committed filters before
 * gating:
 *
 *   1. PATH FILTER  — generated/vendor artifacts never produce findings:
 *      release/, dist/, reports/, node_modules/, wasm-bindgen pkg/ glue,
 *      vendored onnxruntime (public/ort/), minified bundles, lockfiles,
 *      test/mock/fixture trees. Lockfiles stay IN scope — the dep
 *      scanner's OSV findings on yarn.lock are real signal and gate
 *      through mythos-exceptions.json like every other finding.
 *      These directories are gitignored build
 *      output or third-party code we do not author.
 *
 *   2. RULE SCOPE   — two pattern rules are refined to their security-
 *      relevant pattern (the builtins over-match on this codebase):
 *        - weak-crypto:     only weak-algorithm createHash() calls count —
 *          the rule's `DES.|RC4|Blowfish` alternative is case-insensitive
 *          and matches English identifier suffixes (`nodes.`, `includes.`).
 *        - timing-attack:   only secret-specific identifiers compared with
 *          `===` count (`token|secret|password|signature|…`) — bare
 *          `key ===`/`hash ===` match keyboard keys, prop names and cache
 *          hashes, never credentials (Firebase Auth owns token handling).
 *      `unhandled-promise` is dropped entirely: the rule flags async
 *      function *definitions* lacking `try`, not unhandled rejections —
 *      every async callback in the codebase matches by construction.
 *
 *   3. EXCEPTIONS   — mythos-exceptions.json accepted risks, same contract
 *      as security-exceptions.json: rule + file + line (±5-line bucket) +
 *      justification + review date. Anything not excepted FAILS the gate —
 *      every severity is a blocker.
 *
 * Deterministic scanners scoped OFF (documented, not suppressed):
 *   - raceConditions — browser JS is single-threaded; the scanner's
 *     read-modify-write/TOCTOU heuristics cannot express a real race on
 *     this architecture (all 60 hits were UI-state/cache patterns).
 *   - session        — no server-side sessions exist (static site +
 *     client-side Firebase Auth); session-rotation rules have no surface.
 *   - bizLogic       — no coupons, payments, purchases or inventory;
 *     business-logic abuse rules have no surface.
 *
 * Output: experiments/docs/reports/mythos-report.json → bundled into
 * dist/deploy-info/ by scripts/build/deploy-info.mjs (CMS "Build" tab).
 * Exit 1 on any unexcepted finding — wire into `yarn verify`.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runScan } from 'mythos-agent/dist/core/run-scan.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const REPORTS_DIR = path.join(ROOT, 'experiments', 'docs', 'reports')
const REPORT_FILE = path.join(REPORTS_DIR, 'mythos-report.json')
const EXCEPTIONS_FILE = path.join(ROOT, 'mythos-exceptions.json')
const SPHINX_RESULTS = path.join(ROOT, '.sphinx', 'results.json')

/**
 * Generated/vendor paths — findings here are artifacts of the build or
 * third-party code, never first-party source. Mirrors .mythos.yml
 * scan.exclude plus the dirs only deterministic scanners can reach
 * (they carry hardcoded ignore lists that predate those excludes).
 */
const PATH_DROP = [
  /(^|\/)release\//,
  /(^|\/)dist\//,
  /node_modules\//,
  /\.min\.js$/,
  /\.map$/,
  /(^|\/)reports\//,
  /local-modules\//,
  /(^|\/)tests\//,
  /__mocks__\//,
  /__fixtures__\//,
  /(^|\/)target\//,
  /^rust\/[^/]+\/pkg\//,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /playwright-report\//,
  /test-results\//,
  /\.lighthouseci\//,
  /website\/public\/wasm\//,
  /website\/public\/ort\//,
  /database\.json$/,
]

/** Rules dropped outright — see header for justification. */
const RULE_DROP = new Set(['unhandled-promise'])

/**
 * Rule refinements — a finding survives only when its snippet matches the
 * security-relevant sub-pattern. Everything else is a scanner over-match.
 */
const RULE_REFINE = {
  'weak-crypto': /createHash\s*\(\s*['"](?:md5|sha1|md4)['"]/i,
  'timing-attack':
    /(?:token|secret|password|passwd|signature|credential|session_?id|api_?key|auth_?token|private_?key|access_?key|client_?secret|signing_?key)\s*===/i,
}

const normPath = (p) =>
  String(p || '')
    .split('\\')
    .join('/')

/**
 * `loadExceptions` — accepted risks from mythos-exceptions.json.
 */
const loadExceptions = () => {
  if (!fs.existsSync(EXCEPTIONS_FILE)) return []

  return JSON.parse(fs.readFileSync(EXCEPTIONS_FILE, 'utf-8')).exceptions || []
}

/**
 * `isExcepted` — rule + file match, line within a ±5 bucket when the
 * exception pins one (same tolerance mythos's own suppression keys use,
 * so small edits above a finding don't silently re-arm it).
 */
const isExcepted = (finding, exceptions) =>
  exceptions.some((ex) => {
    if (ex.rule !== finding.rule) return false
    if (normPath(ex.file) !== normPath(finding.location && finding.location.file)) return false
    if (ex.line == null) return true

    return Math.abs((finding.location?.line || 0) - ex.line) <= 5
  })

const main = async () => {
  const exceptions = loadExceptions()

  const result = await runScan(ROOT, {
    // Scoped off — see header. Everything else stays at its default (on).
    raceConditions: false,
    session: false,
    bizLogic: false,
  })

  const findings = result.findings || []

  const pathDropped = []
  const ruleDropped = []
  const refined = []
  const active = []

  for (const f of findings) {
    const file = normPath(f.location && f.location.file)

    if (PATH_DROP.some((rx) => rx.test(file))) {
      pathDropped.push(f)
      continue
    }

    if (RULE_DROP.has(f.rule)) {
      ruleDropped.push(f)
      continue
    }

    const refine = RULE_REFINE[f.rule]

    if (refine && !refine.test(f.location?.snippet || '')) {
      ruleDropped.push(f)
      continue
    }

    if (isExcepted(f, exceptions)) {
      refined.push(f)
      continue
    }

    active.push(f)
  }

  const bySeverity = {}
  for (const f of active) bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1

  const report = {
    timestamp: new Date().toISOString(),
    engine: 'mythos-agent',
    filesScanned: result.filesScanned,
    languages: result.languages,
    durationMs: result.durationMs,
    totals: {
      raw: findings.length,
      pathFiltered: pathDropped.length,
      ruleFiltered: ruleDropped.length,
      excepted: refined.length,
      violations: active.length,
    },
    violationsBySeverity: bySeverity,
    violations: active,
    exceptedFindings: refined,
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2))

  // Mirror into .sphinx/results.json so `mythos-agent report|baseline`
  // reflects the gated view.
  try {
    fs.mkdirSync(path.dirname(SPHINX_RESULTS), { recursive: true })
    fs.writeFileSync(
      SPHINX_RESULTS,
      JSON.stringify(
        {
          projectPath: ROOT,
          timestamp: report.timestamp,
          duration: result.durationMs,
          languages: result.languages,
          filesScanned: result.filesScanned,
          confirmedVulnerabilities: active,
          exceptedCount: refined.length,
          filteredCount: pathDropped.length + ruleDropped.length,
        },
        null,
        2
      )
    )
  } catch {
    // .sphinx mirror is best-effort — the committed report is authoritative.
  }

  const sev = ['critical', 'high', 'medium', 'low']
    .filter((s) => bySeverity[s])
    .map((s) => `${bySeverity[s]} ${s}`)
    .join(', ')

  console.log(`mythos-agent scan — ${result.filesScanned} files, ${result.durationMs}ms`)
  console.log(
    `  raw findings: ${findings.length} → path-filtered: ${pathDropped.length}, rule-filtered: ${ruleDropped.length}, excepted: ${refined.length}`
  )

  if (active.length === 0) {
    console.log('  ✓ no unexcepted findings — gate passes')
    process.exit(0)
  }

  console.log(`  ✗ ${active.length} unexcepted findings (${sev}) — gate FAILS`)

  for (const f of active.slice(0, 40)) {
    console.log(`    [${f.severity}] ${f.rule} — ${normPath(f.location?.file)}:${f.location?.line}`)
  }

  if (active.length > 40)
    console.log(`    … and ${active.length - 40} more (see ${path.relative(ROOT, REPORT_FILE)})`)

  process.exit(1)
}

main().catch((err) => {
  console.error('mythos-scan failed to run:', err)
  process.exit(1)
})
