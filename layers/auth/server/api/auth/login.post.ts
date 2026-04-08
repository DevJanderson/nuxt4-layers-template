/**
 * POST /api/auth/login
 *
 * Adaptador HTTP fino — valida input, executa use case, retorna resposta.
 * Toda lógica de negócio está em server/usecase/login.ts.
 */

import { loginRequestSchema } from '../../../app/types/schemas'

export default defineEventHandler(async event => {
  const { username, password } = await validateBody(event, loginRequestSchema)

  const result = await executeLogin({ username, password })

  return handleLoginResult(event, result)
})
