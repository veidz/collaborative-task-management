export interface UserPayload {
  sub: string
  id: string
  email: string
  username: string
  type: 'access' | 'refresh'
}
