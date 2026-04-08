/**
 * Types do módulo Auth
 */

// ============================================================================
// RE-EXPORTS DE SCHEMAS LOCAIS
// ============================================================================

export type { LoginRequest as LoginCredentials } from './schemas'

// ============================================================================
// TIPOS ESPECÍFICOS DO BFF
// Tipos adaptados para uso no cliente (sem expor tokens)
// ============================================================================

/**
 * Permissão de acesso (formato do cliente)
 * Adiciona 'codigo' que é usado internamente para verificações
 */
export interface AuthPermissao {
  id: number
  /** Código único da permissão (ex: 'dashboard.view') */
  codigo: string
  nome: string
  descricao?: string | null
}

/**
 * Grupo de usuários (formato do cliente)
 */
export interface AuthGrupo {
  id: number
  nome: string
  descricao?: string | null
}

/**
 * Usuário autenticado (dados públicos para o cliente)
 * Baseado em UsuarioSchemaDetalhes mas com permissões/grupos simplificados
 */
export interface AuthUser {
  id: number
  nome: string
  email: string
  ativo: boolean
  telefone?: string | null
  estado?: string | null
  cidade?: string | null
  funcao?: string | null
  instituicao?: string | null
  ultimo_login?: string | null
  permissoes: AuthPermissao[]
  grupos: AuthGrupo[]
}

/**
 * Resposta de login do BFF (sem tokens - ficam em cookies httpOnly)
 */
export interface LoginResponse {
  user: AuthUser
}

/**
 * Dados para reset de senha
 */
export interface ResetPasswordData {
  email: string
}

/**
 * Resposta de reset de senha
 */
export interface ResetPasswordResponse {
  message: string
}
