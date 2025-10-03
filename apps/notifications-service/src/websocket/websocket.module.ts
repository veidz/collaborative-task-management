import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { NotificationsGateway } from './websocket.gateway'
import { ConnectionManagerService } from './connection-manager.service'

@Module({
  imports: [
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
  providers: [NotificationsGateway, ConnectionManagerService],
  exports: [NotificationsGateway, ConnectionManagerService],
})
export class WebSocketModule {}
