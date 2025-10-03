import { Module } from '@nestjs/common'
import { EventsPublisherService } from './events-publisher.service'

@Module({
  providers: [EventsPublisherService],
  exports: [EventsPublisherService],
})
export class EventsModule {}
