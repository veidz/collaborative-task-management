export interface RegisterDto {
  email: string
  username: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RefreshDto {
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
}
