import { ApiProperty } from '@nestjs/swagger'
import { TaskResponseDto } from './task-response.dto'

export class PaginatedTasksResponseDto {
  @ApiProperty({
    type: [TaskResponseDto],
    description: 'Array of tasks',
  })
  data: TaskResponseDto[]

  @ApiProperty({
    example: 50,
    description: 'Total number of tasks',
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
