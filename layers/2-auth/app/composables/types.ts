export interface User {
  id: string
  email: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
