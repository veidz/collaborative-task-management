import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { ErrorHandlerService } from '../common/services/error-handler.service'

@Module({
  imports: [HttpModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, ErrorHandlerService],
})
export class NotificationsModule {}
