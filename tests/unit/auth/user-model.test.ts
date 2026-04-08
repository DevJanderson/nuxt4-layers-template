import { describe, it, expect } from 'vitest'
import {
  createUserModel,
  userHasPermission,
  userHasAnyPermission,
  userHasGroup,
  userHasAnyGroup
} from '../../../layers/auth/app/utils/user-model'
import type { AuthUser } from '../../../layers/auth/app/types'

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    nome: 'João Silva',
    email: 'joao@test.com',
    ativo: true,
    permissoes: [
      { id: 1, codigo: 'dashboard.view', nome: 'Ver Dashboard' },
      { id: 2, codigo: 'reports.export', nome: 'Exportar Relatórios' }
    ],
    grupos: [
      { id: 1, nome: 'admin' },
      { id: 2, nome: 'editores' }
    ],
    ...overrides
  }
}

describe('UserModel', () => {
  describe('createUserModel()', () => {
    it('cria model com campos derivados', () => {
      const model = createUserModel(makeUser())
      expect(model.id).toBe(1)
      expect(model.nome).toBe('João Silva')
      expect(model.email).toBe('joao@test.com')
      expect(model.ativo).toBe(true)
    })

    it('extrai códigos de permissão', () => {
      const model = createUserModel(makeUser())
      expect(model.permissions).toEqual(['dashboard.view', 'reports.export'])
    })

    it('extrai nomes de grupo', () => {
      const model = createUserModel(makeUser())
      expect(model.groups).toEqual(['admin', 'editores'])
    })

    it('calcula initials com nome composto', () => {
      const model = createUserModel(makeUser({ nome: 'João Silva' }))
      expect(model.initials).toBe('JS')
    })

    it('calcula initials com nome simples', () => {
      const model = createUserModel(makeUser({ nome: 'Admin' }))
      expect(model.initials).toBe('AD')
    })

    it('calcula initials vazio para nome vazio', () => {
      const model = createUserModel(makeUser({ nome: '' }))
      expect(model.initials).toBe('')
    })

    it('calcula initials com 3+ nomes (primeiro + último)', () => {
      const model = createUserModel(makeUser({ nome: 'Ana Maria Costa' }))
      expect(model.initials).toBe('AC')
    })

    it('detecta isAdmin', () => {
      const admin = createUserModel(makeUser())
      expect(admin.isAdmin).toBe(true)

      const user = createUserModel(makeUser({ grupos: [{ id: 1, nome: 'editores' }] }))
      expect(user.isAdmin).toBe(false)
    })

    it('retorna objeto imutável', () => {
      const model = createUserModel(makeUser())
      expect(Object.isFrozen(model)).toBe(true)
    })

    it('preserva raw DTO', () => {
      const dto = makeUser()
      const model = createUserModel(dto)
      expect(model.raw).toBe(dto)
    })

    it('lida com permissões/grupos undefined', () => {
      const model = createUserModel(
        makeUser({
          permissoes: undefined as unknown as AuthUser['permissoes'],
          grupos: undefined as unknown as AuthUser['grupos']
        })
      )
      expect(model.permissions).toEqual([])
      expect(model.groups).toEqual([])
      expect(model.isAdmin).toBe(false)
    })
  })

  describe('funções de permissão', () => {
    const model = createUserModel(makeUser())

    it('userHasPermission verifica código', () => {
      expect(userHasPermission(model, 'dashboard.view')).toBe(true)
      expect(userHasPermission(model, 'admin.delete')).toBe(false)
    })

    it('userHasAnyPermission verifica qualquer código', () => {
      expect(userHasAnyPermission(model, ['admin.delete', 'dashboard.view'])).toBe(true)
      expect(userHasAnyPermission(model, ['admin.delete', 'admin.create'])).toBe(false)
    })

    it('userHasGroup verifica nome', () => {
      expect(userHasGroup(model, 'admin')).toBe(true)
      expect(userHasGroup(model, 'superadmin')).toBe(false)
    })

    it('userHasAnyGroup verifica qualquer nome', () => {
      expect(userHasAnyGroup(model, ['superadmin', 'editores'])).toBe(true)
      expect(userHasAnyGroup(model, ['superadmin', 'viewers'])).toBe(false)
    })
  })
})
