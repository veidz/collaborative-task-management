import { Module } from '@nestjs/common'
import { EventsConsumerService } from './events-consumer.service'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  providers: [EventsConsumerService],
})
export class EventsConsumerModule {}
