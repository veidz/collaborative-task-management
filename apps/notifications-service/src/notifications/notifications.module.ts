import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationsService } from './notifications.service'
import { NotificationsRepository } from './notifications.repository'
import { Notification } from './entities/notification.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
