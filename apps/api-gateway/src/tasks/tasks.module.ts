import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { ErrorHandlerService } from '../common/services/error-handler.service'

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService, ErrorHandlerService],
})
export class TasksModule {}
