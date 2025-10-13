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
