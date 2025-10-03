import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'
import { CommentsRepository } from './comments.repository'
import { Comment } from './entities/comment.entity'
import { TasksRepository } from '../tasks/tasks.repository'
import { Task } from '../tasks/entities/task.entity'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Task]), EventsModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, TasksRepository],
})
export class CommentsModule {}
