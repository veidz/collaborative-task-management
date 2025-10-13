import { Injectable } from '@nestjs/common'
import { Task } from '../entities/task.entity'
import { TaskAssignment } from '../entities/task-assignment.entity'
import { TaskResponseDto } from '../dto/responses'
import {
  AuthServiceClient,
  UserDto,
} from '../../common/clients/auth-service.client'

@Injectable()
export class TaskMapper {
  constructor(private readonly authServiceClient: AuthServiceClient) {}

  async toResponseDto(task: Task): Promise<TaskResponseDto> {
    const assigneeIds = task.assignments?.map((a) => a.userId) || []
    const validUsers = await this.fetchValidUsers(assigneeIds)

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      createdBy: task.createdBy,
      assignees: this.mapAssignees(task.assignments || [], validUsers),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }

  async toResponseDtoList(tasks: Task[]): Promise<TaskResponseDto[]> {
    return Promise.all(tasks.map((task) => this.toResponseDto(task)))
  }

  private async fetchValidUsers(
    assigneeIds: string[],
  ): Promise<Map<string, UserDto>> {
    if (assigneeIds.length === 0) {
      return new Map()
    }
    return this.authServiceClient.validateUsers(assigneeIds)
  }

  private mapAssignees(
    assignments: TaskAssignment[],
    validUsers: Map<string, UserDto>,
  ) {
    return assignments.map((assignment) => {
      const user = validUsers.get(assignment.userId)
      return {
        id: assignment.userId,
        email: user?.email || '',
        username: user?.username || '',
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedBy,
      }
    })
  }
}
