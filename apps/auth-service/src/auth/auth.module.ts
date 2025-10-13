import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UsersModule } from '../users/users.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import {
  RegisterUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  GetProfileUseCase,
} from './use-cases'
import { UserMapper } from './mappers/user.mapper'
import { TokenGenerator } from './utils/token-generator'
import { PasswordHasher } from './utils/password-hasher'

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET')

        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables')
        }

        return {
          secret,
          signOptions: {
            expiresIn:
              configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
          },
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    GetProfileUseCase,
    // Utils
    UserMapper,
    TokenGenerator,
    PasswordHasher,
  ],
  exports: [JwtModule, PassportModule, AuthService, UserMapper],
})
export class AuthModule {}
