export interface RegisterDto {
  email: string
  username: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserResponse
}

export interface UserResponse {
  id: string
  email: string
  username: string
  createdAt: Date
  updatedAt: Date
}

export interface JwtPayload {
  sub: string
  email: string
  username: string
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export interface CurrentUserData {
  id: string
  email: string
  username: string
}

export interface UserPayload {
  id: string
  email: string
  username: string
}
