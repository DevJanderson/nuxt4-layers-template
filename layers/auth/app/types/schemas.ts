import { z } from 'zod'

export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export const tokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.optional(z.string().default('bearer'))
})

export const resetPasswordRequestSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido').max(255)
})

export const signupRequestSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido').max(255),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(255),
  telefone: z.string().max(20).optional(),
  estado: z.string().max(2).optional(),
  cidade: z.string().max(255).optional(),
  funcao: z.string().max(255).optional(),
  instituicao: z.string().max(255).optional()
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type Token = z.infer<typeof tokenSchema>
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>
export type SignupRequest = z.infer<typeof signupRequestSchema>
