import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'
import { Comment } from './entities/comment.entity'
import { Task } from '../tasks/entities/task.entity'
import { EventsModule } from '../events/events.module'
import { ClientsModule } from '../common/clients/clients.module'
import { TasksModule } from '../tasks/tasks.module'
import { CommentMapper } from './mappers/comment.mapper'
import { CreateCommentUseCase, FindCommentsUseCase } from './use-cases'

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Task]),
    EventsModule,
    ClientsModule,
    TasksModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentMapper,
    CreateCommentUseCase,
    FindCommentsUseCase,
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
