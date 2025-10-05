import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'
import { Comment } from './entities/comment.entity'
import { Task } from '../tasks/entities/task.entity'
import { EventsModule } from '../events/events.module'
import { ClientsModule } from 'src/common/clients/clients.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Task]),
    EventsModule,
    ClientsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
