import { ApiProperty } from '@nestjs/swagger'
import { CommentResponseDto } from './comment-response.dto'

export class PaginatedCommentsResponseDto {
  @ApiProperty({
    type: [CommentResponseDto],
    description: 'Array of comments',
  })
  data: CommentResponseDto[]

  @ApiProperty({
    example: 50,
    description: 'Total number of comments',
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
