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
