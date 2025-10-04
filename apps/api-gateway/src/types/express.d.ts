import { UserPayload } from '../common/types/user.type'

declare module 'express-serve-static-core' {
  interface Request {
    user: UserPayload
  }
}
