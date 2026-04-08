#!/usr/bin/env node

/**
 * Gera public/llms-full.txt concatenando toda a documentação do projeto.
 * Formato: Markdown contínuo com separadores entre seções.
 *
 * Uso: node scripts/generate-llms-full.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DOCS_DIR = join(ROOT, 'content/docs')
const OUTPUT = join(ROOT, 'public/llms-full.txt')

// Ordem das seções (diretórios e arquivos raiz)
const SECTION_ORDER = ['index.md', 'arquitetura', 'seguranca', 'paginas', 'api', 'projeto']

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n/)
  return match ? content.slice(match[0].length).trim() : content.trim()
}

function collectFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full))
    } else if (entry.endsWith('.md')) {
      files.push(full)
    }
  }
  return files
}

function buildOrderedFiles() {
  const ordered = []

  for (const section of SECTION_ORDER) {
    const full = join(DOCS_DIR, section)
    try {
      if (statSync(full).isDirectory()) {
        ordered.push(...collectFiles(full))
      } else {
        ordered.push(full)
      }
    } catch {
      // Section doesn't exist, skip
    }
  }

  return ordered
}

// Header
const parts = [
  '# Nuxt 4 Template — Documentação Completa',
  '',
  '> Template world-class para iniciar qualquer projeto com Nuxt 4.',
  '> Gerado automaticamente a partir de content/docs/.',
  '',
  '---',
  ''
]

const files = buildOrderedFiles()

for (const file of files) {
  const rel = relative(DOCS_DIR, file)
  const content = readFileSync(file, 'utf-8')
  const body = stripFrontmatter(content)

  if (body) {
    parts.push(`<!-- source: content/docs/${rel} -->`)
    parts.push('')
    parts.push(body)
    parts.push('')
    parts.push('---')
    parts.push('')
  }
}

writeFileSync(OUTPUT, parts.join('\n'), 'utf-8')

const sizeKB = (Buffer.byteLength(parts.join('\n')) / 1024).toFixed(1)
// eslint-disable-next-line no-console
console.log(`✅ Gerado ${OUTPUT}`)
// eslint-disable-next-line no-console
console.log(`   ${files.length} arquivos, ${sizeKB} KB`)
