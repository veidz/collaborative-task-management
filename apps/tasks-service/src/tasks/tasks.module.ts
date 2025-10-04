import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { Task } from './entities/task.entity'
import { TaskAssignment } from './entities/task-assignment.entity'
import { EventsModule } from '../events/events.module'
import { ClientsModule } from '../common/clients/clients.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskAssignment]),
    EventsModule,
    ClientsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
