import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
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

  @ApiPropertyOptional({
    example: 'Add JWT authentication with refresh tokens',
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
    example: TaskPriority.MEDIUM,
    description: 'Task priority',
  })
  priority: TaskPriority

  @ApiPropertyOptional({
    example: '2025-10-10T12:00:00.000Z',
    description: 'Task deadline',
    nullable: true,
  })
  deadline: Date | null

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID who created the task',
  })
  createdById: string

  @ApiProperty({
    example: '2025-10-03T00:17:30.000Z',
    description: 'Task creation timestamp',
  })
  createdAt: Date

  @ApiProperty({
    example: '2025-10-03T00:17:30.000Z',
    description: 'Task last update timestamp',
  })
  updatedAt: Date
}
