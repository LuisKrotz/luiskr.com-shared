/**
 * @file jsx-transformer.js
 * Jest code transformer: converts JSX to h() calls synchronously
 * using rolldown/utils transformSync (same engine as Vite / oxc).
 * Handles .js/.jsx/.ts/.tsx — TypeScript sources are stripped and
 * transformed with lang 'ts'/'tsx'.
 *
 * Exports both `process` (sync, required by Jest) and `processAsync`
 * for compatibility.
 */

import { transformSync } from 'rolldown/utils'

const LANG_FOR = {
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.mjs': 'jsx',
  '.mts': 'ts',
}

/** @type {import('@jest/transform').SyncTransformer} */
const transformer = {
  process(sourceText, sourcePath) {
    if (sourcePath.includes('/node_modules/')) {
      return { code: sourceText }
    }

    const ext = sourcePath.slice(sourcePath.lastIndexOf('.'))
    const lang = LANG_FOR[ext]

    if (!lang) {
      return { code: sourceText }
    }

    // oxc picks parser options from the filename extension — .js sources get
    // a .jsx alias so JSX parses in plain-js files (project convention).
    const filename = ext === '.js' ? `${sourcePath.slice(0, -3)}.jsx` : sourcePath

    const result = transformSync(filename, sourceText, {
      lang,
      jsx: { runtime: 'classic', pragma: 'h', pragmaFrag: 'Fragment' },
      // Emit the source map — jest's coverage instrumenter (istanbul) maps
      // its counters back through it. Without one, transpiled positions are
      // attributed as source positions and coverage lines drift wherever the
      // transform stripped types/comments.
      sourcemap: true,
      // `import.meta.env` / `import.meta.hot` are Vite compile-time globals —
      // under Jest they do not exist, so map them to runtime globals tests can
      // populate per-file (undefined by default, which keeps every env/HMR
      // check falsy as before).
      define: {
        'import.meta.env': 'globalThis.__VITE_ENV__',
        'import.meta.hot': 'globalThis.__VITE_HOT__',
      },
    })

    if (result.errors && result.errors.length > 0) {
      const errMsg = result.errors.map((e) => e.message || String(e)).join('\n')
      throw new Error(`JSX transform failed for ${sourcePath}:\n${errMsg}`)
    }

    // oxc leaves multiline template-literal interiors — including the
    // closing-backtick line — unmapped. istanbul resolves every
    // statement's start AND end through the map; a statement ending
    // inside an unmapped span is dropped, and a file whose statements
    // all drop vanishes from coverage entirely (istanbul-lib-source-maps
    // reports "nothing could be mapped" and emits no entry). Filling
    // each empty generated line with an `AAAA` segment (generated
    // column 0 → previous source position) gives statement ends a
    // resolvable position without touching real mappings.
    if (result.map && typeof result.map.mappings === 'string') {
      result.map.mappings = result.map.mappings
        .split(';')
        .map((line) => line || 'AAAA')
        .join(';')
    }

    return { code: result.code, map: result.map }
  },

  async processAsync(sourceText, sourcePath) {
    return transformer.process(sourceText, sourcePath)
  },
}

export default transformer
