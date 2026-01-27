/**
 * Tipos globais para API
 * Compartilhados entre todos os layers
 */

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
}

export interface RequestOptions {
  showError?: boolean
  showSuccess?: boolean
  successMessage?: string
}
