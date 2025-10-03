import { ApiProperty } from '@nestjs/swagger'
import { NotificationType } from '../entities/notification.entity'

export class NotificationResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Notification unique identifier',
  })
  id: string

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID',
  })
  userId: string

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.TASK_CREATED,
    description: 'Notification type',
  })
  type: NotificationType

  @ApiProperty({
    example: 'New task created: "Implement user authentication"',
    description: 'Notification message',
  })
  message: string

  @ApiProperty({
    example: false,
    description: 'Read status',
  })
  read: boolean

  @ApiProperty({
    example: '2025-10-03T20:50:34.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date
}
