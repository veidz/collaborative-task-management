import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsUUID,
  ValidateIf,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from '../../enums/task-status.enum'
import { TaskPriority } from '../../enums/task-priority.enum'

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Task title',
    example: 'Implement user authentication',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  title?: string

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Implement JWT-based authentication with refresh tokens',
    nullable: true,
  })
  @ValidateIf((o) => o.description !== null && o.description !== undefined)
  @IsString()
  @IsOptional()
  description?: string | null

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority

  @ApiPropertyOptional({
    description: 'Task deadline',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  deadline?: string

  @ApiPropertyOptional({
    description:
      'Array of user IDs to assign to this task (replaces existing assignees)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[]
}
