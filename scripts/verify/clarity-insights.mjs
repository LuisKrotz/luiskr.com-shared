#!/usr/bin/env node
/**
 * @file clarity-insights.mjs
 * @description Pulls the Microsoft Clarity "project-live-insights" Data
 *   Export for the production site and writes
 *   experiments/docs/reports/clarity-insights.json — the same reports dir
 *   deploy-info bundles into the CMS Build tab. This is the automated
 *   version of the manual Clarity paste: JS-error leaders, frustration
 *   clicks, perf medians — queryable in CI instead of by hand.
 *
 *   Auth: `Authorization: Bearer $CLARITY_TOKEN` — the project-admin
 *   Data Export JWT (Settings → Data Export → Generate new API token),
 *   supplied by the GitHub Actions secret of the same name. A missing
 *   token SKIPS the pull (exit 0): forks and local dev have no secret
 *   and must never gate on it.
 *
 *   Window/dimensions: `CLARITY_NUM_OF_DAYS` (1|2|3, default 1) and
 *   optional `CLARITY_DIMENSION1..3` (Browser, Device, Country/Region,
 *   OS, Source, Medium, Campaign, Channel, URL).
 *
 *   Gate: warn-only by default — production telemetry is a signal, not
 *   a property of the commit under test. Setting
 *   `CLARITY_MAX_JS_ERROR_PCT=<percent>` fails the run when sessions
 *   carrying JavaScript errors exceed that share of total sessions.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
// Scan outputs live inside the docs module — the portal serves them under
// /docs/reports/ and deploy-info bundles them from there (root stays clean).
const REPORTS_DIR = path.join(ROOT, 'experiments', 'docs', 'reports')
const REPORT_FILE = path.join(REPORTS_DIR, 'clarity-insights.json')

const ENDPOINT = 'https://www.clarity.ms/export-data/api/v1/project-live-insights'
const TOKEN = process.env.CLARITY_TOKEN
const NUM_OF_DAYS = process.env.CLARITY_NUM_OF_DAYS || '1'
const MAX_JS_ERROR_PCT = process.env.CLARITY_MAX_JS_ERROR_PCT
const DIMENSIONS = ['CLARITY_DIMENSION1', 'CLARITY_DIMENSION2', 'CLARITY_DIMENSION3']
  .map((key) => process.env[key])
  .filter(Boolean)

const writeReport = (payload) => {
  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(REPORT_FILE, `${JSON.stringify(payload, null, 2)}\n`)
}

if (!TOKEN) {
  writeReport({ skipped: 'CLARITY_TOKEN unset', generatedAt: new Date().toISOString() })
  console.log('clarity-insights: CLARITY_TOKEN unset — skipping (non-blocking).')
  process.exit(0)
}

const url = new URL(ENDPOINT)
url.searchParams.set('numOfDays', NUM_OF_DAYS)
DIMENSIONS.forEach((dimension, i) => url.searchParams.set(`dimension${i + 1}`, dimension))

let response

try {
  response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/json',
    },
  })
} catch (error) {
  writeReport({
    failed: `fetch: ${error instanceof Error ? error.message : String(error)}`,
    generatedAt: new Date().toISOString(),
  })
  console.log(`clarity-insights: fetch failed — ${error instanceof Error ? error.message : error}`)
  process.exit(0)
}

if (!response.ok) {
  const body = await response.text()

  writeReport({
    failed: `HTTP ${response.status}`,
    body: body.slice(0, 2000),
    generatedAt: new Date().toISOString(),
  })
  console.log(`clarity-insights: HTTP ${response.status} — ${body.slice(0, 200)}`)
  process.exit(0)
}

const data = await response.json()

writeReport({
  generatedAt: new Date().toISOString(),
  numOfDays: Number(NUM_OF_DAYS),
  dimensions: DIMENSIONS,
  data,
})

// The payload is an array of metric groups whose `information` entries are
// flat key→value objects; field names vary per metric, so surface them all.
const groups = Array.isArray(data) ? data : [data]

console.log(
  `clarity-insights: last ${NUM_OF_DAYS}d${DIMENSIONS.length ? ` by ${DIMENSIONS.join(' + ')}` : ''}`
)

for (const group of groups) {
  const name = group?.metricName ?? 'metric'
  const rows = Array.isArray(group?.information) ? group.information : []

  console.log(`\n── ${name} ──`)

  for (const row of rows) {
    const cells = Object.entries(row)
      .map(([key, value]) => `${key}=${value}`)
      .join('  ')

    console.log(`   ${cells}`)
  }
}

// ── Optional gate ────────────────────────────────────────────────────────────
// Find the JS-error session share wherever the schema carries it: any number
// whose key reads as script-error sessions, over any total-session count.
const numbers = []

const walk = (node) => {
  if (Array.isArray(node)) return node.forEach(walk)

  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'number' || /^\d+(?:\.\d+)?$/.test(String(value))) {
        numbers.push([key, Number(value)])
      } else {
        walk(value)
      }
    }
  }
}

walk(data)

const jsErrorSessions = numbers
  .filter(([key]) => /script.?error|js.?error/i.test(key) && /session/i.test(key))
  .map(([, value]) => value)
  .reduce((a, b) => a + b, 0)

const totalSessions = numbers
  .filter(([key]) => /total.*session.*count|session.*total/i.test(key))
  .map(([, value]) => value)[0]

if (MAX_JS_ERROR_PCT !== undefined && totalSessions > 0) {
  const pct = (jsErrorSessions / totalSessions) * 100

  console.log(`\njs-error session share: ${pct.toFixed(2)}% of ${totalSessions} sessions`)

  if (pct > Number(MAX_JS_ERROR_PCT)) {
    console.error(
      `clarity-insights: FAIL — ${pct.toFixed(2)}% > CLARITY_MAX_JS_ERROR_PCT=${MAX_JS_ERROR_PCT}%`
    )
    process.exit(1)
  }
}
