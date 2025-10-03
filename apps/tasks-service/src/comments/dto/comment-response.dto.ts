import { ApiProperty } from '@nestjs/swagger'

export class CommentResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Comment unique identifier',
  })
  id: string

  @ApiProperty({
    example: 'This task looks great!',
    description: 'Comment content',
  })
  content: string

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Task ID',
  })
  taskId: string

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Author user ID',
  })
  authorId: string

  @ApiProperty({
    example: '2025-10-03T14:08:46.000Z',
    description: 'Comment creation timestamp',
  })
  createdAt: Date

  @ApiProperty({
    example: '2025-10-03T14:08:46.000Z',
    description: 'Comment last update timestamp',
  })
  updatedAt: Date
}
