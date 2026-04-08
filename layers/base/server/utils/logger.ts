/**
 * Logger centralizado para o server-side (BFF)
 * Usa consola (já incluso no Nuxt/Nitro) com tag do projeto
 * Auto-importado pelo Nitro em todos os endpoints e utils
 *
 * - Dev: formato legível (FancyReporter padrão do consola)
 * - Produção: JSON estruturado (uma linha por log, para Datadog/Grafana/Sentry)
 * - Log level: controlável via env CONSOLA_LEVEL (0=error, 3=info, 4=debug)
 */

import { createConsola } from 'consola'
import type { ConsolaReporter, LogObject, ConsolaOptions } from 'consola'

// ============================================================================
// REPORTER JSON (produção)
// ============================================================================

const jsonReporter: ConsolaReporter = {
  log(logObj: LogObject, ctx: { options: ConsolaOptions }) {
    const entry: Record<string, unknown> = {
      timestamp: logObj.date.toISOString(),
      level: logObj.type,
      message: logObj.args[0] ?? '',
      ...(logObj.tag ? { tag: logObj.tag } : {})
    }

    // Args extras (ex: logger.info('msg', { userId: 42 }))
    if (logObj.args.length > 1) {
      const extra = logObj.args.slice(1)
      // Se o segundo arg for um objeto, espalha no root (flat)
      if (extra.length === 1 && typeof extra[0] === 'object' && extra[0] !== null) {
        Object.assign(entry, extra[0])
      } else {
        entry.context = extra
      }
    }

    // Propriedades extras injetadas via withDefaults (requestId, userId, etc.)
    const reserved = new Set(['date', 'args', 'type', 'level', 'tag', 'message'])
    for (const [key, value] of Object.entries(logObj)) {
      if (!reserved.has(key) && value !== undefined) {
        entry[key] = value
      }
    }

    const line = JSON.stringify(entry)
    const stream = logObj.level <= 1 ? ctx.options.stderr : ctx.options.stdout
    stream?.write(line + '\n')
  }
}

// ============================================================================
// INSTÂNCIA DO LOGGER
// ============================================================================

const isProduction = process.env.NODE_ENV === 'production'

export const logger = createConsola({
  // CONSOLA_LEVEL env var é lida automaticamente pelo createConsola
  fancy: !isProduction,
  reporters: isProduction ? [jsonReporter] : undefined,
  defaults: { tag: 'app' }
})
