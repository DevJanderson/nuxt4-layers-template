// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const AuthErrors = {
  INVALID_CREDENTIALS: 'credenciais inválidas',
  SESSION_EXPIRED: 'sessão expirada, faça login novamente',
  NOT_AUTHENTICATED: 'não autenticado',
  FORBIDDEN: 'você não tem permissão para acessar esta página',
  ADMIN_ONLY: 'acesso restrito a administradores',
  REFRESH_FAILED: 'falha ao renovar sessão',
  REFRESH_TOKEN_MISSING: 'refresh token não encontrado',
  LOGIN_FAILED: 'falha ao realizar login',
  SIGNUP_FAILED: 'falha ao realizar cadastro',
  LOGOUT_FAILED: 'falha ao realizar logout',
  FETCH_USER_FAILED: 'falha ao buscar dados do usuário',
  RESET_PASSWORD_FAILED: 'falha ao solicitar reset de senha',
  CONFIG_MISSING: 'URL da API não configurada'
} as const

export type AuthErrorCode = (typeof AuthErrors)[keyof typeof AuthErrors]

export const AuthMessages = {
  TOKEN_REFRESHED: 'token renovado com sucesso',
  LOGOUT_SUCCESS: 'logout realizado com sucesso',
  RESET_PASSWORD_SENT:
    'se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.'
} as const

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export const ValidationErrors = {
  INVALID_BODY: 'dados inválidos no corpo da requisição',
  INVALID_QUERY: 'parâmetros de consulta inválidos',
  INVALID_PARAM: (name: string) => `parâmetro de rota inválido: ${name}` as const
} as const

export type ValidationErrorCode =
  | (typeof ValidationErrors)['INVALID_BODY']
  | (typeof ValidationErrors)['INVALID_QUERY']
  | ReturnType<(typeof ValidationErrors)['INVALID_PARAM']>
