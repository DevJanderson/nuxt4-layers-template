import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'

/**
 * Kubb - Code generation a partir de OpenAPI spec
 *
 * Gotchas:
 * - extension: { '.ts': '' } necessário para verbatimModuleSyntax
 * - NÃO usar typed, inferred ou importType no plugin Zod
 * - dateType: 'string' em ambos os plugins
 * - Conteúdo de generated/ NÃO deve ser editado manualmente
 *
 * @see https://kubb.dev/
 */
export default defineConfig({
  name: 'api',
  root: '.',
  input: {
    path: './openapi/spec.json'
  },
  output: {
    path: './generated/api',
    clean: true,
    extension: { '.ts': '' }
  },
  plugins: [
    pluginOas(),
    pluginTs({
      output: { path: './types', barrelType: 'named' },
      group: { type: 'tag', name: ({ group }) => `${group}Types` },
      enumType: 'enum',
      dateType: 'string'
    }),
    pluginZod({
      output: { path: './zod', barrelType: 'named' },
      group: { type: 'tag', name: ({ group }) => `${group}Schemas` },
      dateType: 'string'
    })
  ]
})
