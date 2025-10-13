import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { Task } from './entities/task.entity'
import { TaskAssignment } from './entities/task-assignment.entity'
import { EventsModule } from '../events/events.module'
import { ClientsModule } from '../common/clients/clients.module'
import { TaskMapper } from './mappers/task.mapper'
import { TaskAuthorizationGuard } from './guards/task-authorization.guard'
import {
  CreateTaskUseCase,
  FindTasksUseCase,
  FindOneTaskUseCase,
  UpdateTaskUseCase,
  DeleteTaskUseCase,
  AssignUsersUseCase,
  UnassignUsersUseCase,
} from './use-cases'

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskAssignment]),
    EventsModule,
    ClientsModule,
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    TaskMapper,
    TaskAuthorizationGuard,
    CreateTaskUseCase,
    FindTasksUseCase,
    FindOneTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    AssignUsersUseCase,
    UnassignUsersUseCase,
  ],
  exports: [TasksService, TaskAuthorizationGuard],
})
export class TasksModule {}
