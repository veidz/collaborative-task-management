import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtStrategy } from '../strategies/jwt.strategy'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

@Module({
  imports: [
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
            expiresIn: '15m',
          },
        }
      },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, PassportModule, JwtModule],
})
export class AuthModule {}
