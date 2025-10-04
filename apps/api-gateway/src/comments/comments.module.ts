import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'

@Module({
  imports: [HttpModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
