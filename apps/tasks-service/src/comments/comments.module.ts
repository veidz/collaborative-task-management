import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'
import { Comment } from './entities/comment.entity'
import { Task } from '../tasks/entities/task.entity'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Task]), EventsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
