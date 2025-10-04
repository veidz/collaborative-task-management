import { ApiProperty } from '@nestjs/swagger'
import { UserAssigneeDto } from './user-assignee.dto'
import { TaskStatus } from '../enums/task-status.enum'
import { TaskPriority } from '../enums/task-priority.enum'

export class TaskResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Task unique identifier',
  })
  id: string

  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Task title',
  })
  title: string

  @ApiProperty({
    example: 'Implement JWT-based authentication with refresh tokens',
    description: 'Task description',
    nullable: true,
  })
  description: string | null

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Task status',
  })
  status: TaskStatus

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Task priority',
  })
  priority: TaskPriority

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
    description: 'Task deadline',
    nullable: true,
  })
  deadline: Date | null

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User who created the task',
  })
  createdBy: string

  @ApiProperty({
    type: [UserAssigneeDto],
    description: 'Assigned users',
  })
  assignees: UserAssigneeDto[]

  @ApiProperty({
    example: '2025-10-03T14:32:33.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date

  @ApiProperty({
    example: '2025-10-03T15:45:12.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date
}
