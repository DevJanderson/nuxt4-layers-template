/** Margem de antecipação para refresh de token (client e server) */
export const TOKEN_REFRESH_MARGIN_SECONDS = 5 * 60

/** Tempo de vida do refresh token em cookies (7 dias) */
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7

/** Nome do grupo de administradores (usado em middleware server e user-model) */
export const ADMIN_GROUP = 'admin' as const
