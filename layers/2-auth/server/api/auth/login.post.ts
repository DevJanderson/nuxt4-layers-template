import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

/**
 * POST /api/auth/login
 * Autentica o usuário e grava tokens em cookies httpOnly.
 *
 * TODO: substituir mock pela chamada real à API externa via authFetch
 */
export default defineEventHandler(async event => {
  const body = await readBody(event)
  const result = loginSchema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  // TODO: chamar API externa de autenticação
  // const response = await $fetch(`${config.apiExternalBaseUrl}/auth/login`, { ... })

  // Mock — substituir por resposta real
  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  }

  setTokenCookies(event, mockTokens)

  return {
    user: {
      id: '1',
      email: result.data.email,
      name: 'Usuário Exemplo'
    }
  }
})
