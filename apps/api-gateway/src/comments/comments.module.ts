import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'
import { ErrorHandlerService } from '../common/services/error-handler.service'

@Module({
  imports: [HttpModule],
  controllers: [CommentsController],
  providers: [CommentsService, ErrorHandlerService],
})
export class CommentsModule {}
