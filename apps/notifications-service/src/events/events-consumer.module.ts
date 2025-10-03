import { Module } from '@nestjs/common'
import { EventsConsumerService } from './events-consumer.service'
import { NotificationsModule } from '../notifications/notifications.module'
import { WebSocketModule } from 'src/websocket/websocket.module'

@Module({
  imports: [NotificationsModule, WebSocketModule],
  providers: [EventsConsumerService],
})
export class EventsConsumerModule {}
