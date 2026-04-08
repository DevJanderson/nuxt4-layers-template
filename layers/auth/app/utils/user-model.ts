/**
 * Domain Model — User
 *
 * Enriquece o DTO AuthUser com lógica de negócio.
 * Factory function + Object.freeze (mesmo padrão dos VOs).
 *
 * Centraliza lógica que antes ficava espalhada nos stores/componentes:
 * - nomeCompleto, initials
 * - hasPermission, hasGroup
 * - isAdmin
 */

import type { AuthUser, AuthPermissao, AuthGrupo } from '../types'
import { ADMIN_GROUP } from '#shared/utils/auth-constants'

export { ADMIN_GROUP }

export interface UserModel {
  /** Dados brutos do DTO */
  readonly raw: AuthUser

  /** Campos derivados */
  readonly id: number
  readonly nome: string
  readonly email: string
  readonly ativo: boolean
  readonly initials: string
  readonly permissions: string[]
  readonly groups: string[]
  readonly isAdmin: boolean
}

export function createUserModel(user: AuthUser): UserModel {
  const permissions = user.permissoes?.map((p: AuthPermissao) => p.codigo).filter(Boolean) ?? []
  const groups = user.grupos?.map((g: AuthGrupo) => g.nome) ?? []
  const initials = computeInitials(user.nome)

  return Object.freeze({
    raw: user,
    id: user.id,
    nome: user.nome,
    email: user.email,
    ativo: user.ativo,
    initials,
    permissions,
    groups,
    isAdmin: groups.includes(ADMIN_GROUP)
  })
}

// ============================================================================
// FUNÇÕES PURAS ASSOCIADAS
// ============================================================================

export function userHasPermission(model: UserModel, codigo: string): boolean {
  return model.permissions.includes(codigo)
}

export function userHasAnyPermission(model: UserModel, codigos: string[]): boolean {
  return codigos.some(c => model.permissions.includes(c))
}

export function userHasGroup(model: UserModel, nome: string): boolean {
  return model.groups.includes(nome)
}

export function userHasAnyGroup(model: UserModel, nomes: string[]): boolean {
  return nomes.some(n => model.groups.includes(n))
}

// ============================================================================
// HELPERS PRIVADOS
// ============================================================================

function computeInitials(nome: string): string {
  if (!nome) return ''
  const names = nome.split(' ')
  if (names.length >= 2) {
    const first = names[0]?.[0] ?? ''
    const last = names[names.length - 1]?.[0] ?? ''
    return `${first}${last}`.toUpperCase()
  }
  return (names[0] ?? '').substring(0, 2).toUpperCase()
}
