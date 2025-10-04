import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  IsArray,
  IsUUID,
} from 'class-validator'
import { TaskStatus } from '../enums/task-status.enum'
import { TaskPriority } from '../enums/task-priority.enum'

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Implement user authentication',
    description: 'Task title',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string

  @ApiPropertyOptional({
    example: 'Implement JWT-based authentication with refresh tokens',
    description: 'Task description',
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    description: 'Task status',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Task priority',
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59.000Z',
    description: 'Task deadline',
  })
  @IsDateString()
  @IsOptional()
  deadline?: Date

  @ApiPropertyOptional({
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description:
      'Array of user IDs to assign (replaces all existing assignees)',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[]
}
