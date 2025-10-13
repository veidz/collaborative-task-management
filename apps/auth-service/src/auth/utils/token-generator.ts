import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class TokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(userId: string, email: string, username: string): string {
    const payload = {
      sub: userId,
      email,
      username,
      type: 'access',
    }

    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    })
  }

  generateRefreshToken(
    userId: string,
    email: string,
    username: string,
  ): string {
    const payload = {
      sub: userId,
      email,
      username,
      type: 'refresh',
    }

    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    })
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token)
  }
}
