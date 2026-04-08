import { AuthMessages } from '#shared/domain/errors'
import { resetPasswordRequestSchema } from '../../../app/types/schemas'

/**
 * POST /api/auth/reset-password
 *
 * Solicita reset de senha enviando email com link.
 * SEGURANÇA: Sempre retorna sucesso para não revelar se o email existe.
 */

export default defineEventHandler(async event => {
  const { email } = await validateBody(event, resetPasswordRequestSchema)

  try {
    const client = createApiClient()
    await $fetch(`${client.baseUrl}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: client.headers,
      body: { email },
      timeout: client.timeout
    })
  } catch (error: unknown) {
    // Log seguro (não expõe detalhes em produção)
    logAuthError('Erro ao solicitar reset de senha', error)
    // Não propaga o erro - sempre retorna sucesso
  }

  // Sempre retorna sucesso para não revelar se o email existe
  return {
    message: AuthMessages.RESET_PASSWORD_SENT
  }
})
