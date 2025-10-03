import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from './common/logger'
import { HealthModule } from './health/health.module'
import typeormConfig from './config/typeorm.config'
import { NotificationsModule } from './notifications/notifications.module'
import { EventsConsumerModule } from './events/events-consumer.module'
import { WebSocketModule } from './websocket/websocket.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...typeormConfig.options,
    }),
    LoggerModule,
    HealthModule,
    NotificationsModule,
    EventsConsumerModule,
    WebSocketModule,
  ],
})
export class AppModule {}
