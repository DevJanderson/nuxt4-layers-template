/**
 * Agent-optimized Vitest reporter
 *
 * Inspirado no PAO (nunomaduro/pao) para PHP.
 * Quando detecta execução dentro de um agente de IA (Claude Code, Cursor, etc.),
 * substitui o output verboso por JSON compacto (~20 tokens).
 *
 * Ativação: Vitest detecta automaticamente via env var CLAUDE_CODE=1
 * ou pode ser forçado com VITEST_AGENT_REPORTER=1.
 *
 * Output:
 *   {"result":"passed","tests":615,"passed":615,"failed":0,"duration_ms":1710}
 */
import type { Reporter } from 'vitest/reporters'
import type { Vitest, File, RunnerTask } from 'vitest'

function isAgentEnvironment(): boolean {
  return !!(
    process.env.CLAUDE_CODE ||
    process.env.CURSOR_SESSION_ID ||
    process.env.DEVIN ||
    process.env.VITEST_AGENT_REPORTER
  )
}

export default class AgentReporter implements Reporter {
  ctx!: Vitest
  startTime = 0

  onInit(ctx: Vitest) {
    this.ctx = ctx
    this.startTime = Date.now()
  }

  onFinished(files?: File[]) {
    if (!files) return

    let passed = 0
    let failed = 0
    let skipped = 0

    function countTests(tasks: RunnerTask[]) {
      for (const task of tasks) {
        if ('tasks' in task && task.tasks?.length) {
          countTests(task.tasks)
        } else {
          if (task.result?.state === 'pass') passed++
          else if (task.result?.state === 'fail') failed++
          else skipped++
        }
      }
    }

    for (const file of files) {
      countTests(file.tasks)
    }

    const total = passed + failed + skipped
    const duration = Date.now() - this.startTime
    const result = failed > 0 ? 'failed' : 'passed'

    const output = JSON.stringify({
      result,
      tests: total,
      passed,
      ...(failed > 0 && { failed }),
      ...(skipped > 0 && { skipped }),
      duration_ms: duration
    })

    process.stdout.write(output + '\n')
  }
}

export { isAgentEnvironment }
