import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator'
import { TaskStatus } from '../enums/task-status.enum'
import { TaskPriority } from '../enums/task-priority.enum'

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Updated task title',
    description: 'Task title',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  title?: string

  @ApiPropertyOptional({
    example: 'Updated task description',
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
    example: '2025-10-15T12:00:00Z',
    description: 'Task deadline (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  deadline?: string
}
