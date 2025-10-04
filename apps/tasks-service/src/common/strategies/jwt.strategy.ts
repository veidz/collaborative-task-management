import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

export interface JwtPayload {
  sub: string
  email: string
  username: string
  type: 'access' | 'refresh'
  iat: number
  exp: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name)

  constructor(readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })

    this.logger.log('JWT Strategy initialized successfully')
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email || !payload.username) {
      throw new UnauthorizedException('Invalid token payload')
    }

    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
    }
  }
}
