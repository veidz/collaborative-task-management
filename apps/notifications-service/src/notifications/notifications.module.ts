import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsRepository } from './notifications.repository'
import { Notification } from './entities/notification.entity'
import { JwtStrategy } from '../common/strategies/jwt.strategy'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
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
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, JwtStrategy],
  exports: [NotificationsService],
})
export class NotificationsModule {}
