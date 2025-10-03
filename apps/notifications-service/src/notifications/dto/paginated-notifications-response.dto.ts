import { ApiProperty } from '@nestjs/swagger'
import { NotificationResponseDto } from './notification-response.dto'

export class PaginatedNotificationsResponseDto {
  @ApiProperty({
    type: [NotificationResponseDto],
    description: 'Array of notifications',
  })
  data: NotificationResponseDto[]

  @ApiProperty({
    example: 50,
    description: 'Total number of notifications',
  })
  total: number

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number

  @ApiProperty({
    example: 10,
    description: 'Items per page',
  })
  limit: number

  @ApiProperty({
    example: 5,
    description: 'Total number of pages',
  })
  totalPages: number
}
