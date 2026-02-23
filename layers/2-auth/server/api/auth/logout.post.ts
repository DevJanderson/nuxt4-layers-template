/**
 * POST /api/auth/logout
 * Remove cookies de autenticação.
 */
export default defineEventHandler((event) => {
  clearTokenCookies(event)
  return { success: true }
})
