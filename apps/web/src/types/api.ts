export interface User {
  id: string
  email: string
  username: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ApiErrorResponse {
  message: string | string[]
  statusCode: number
  error?: string
}
