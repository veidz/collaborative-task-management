import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CommentAuthorDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID',
  })
  id: string

  @ApiProperty({
    example: 'johndoe',
    description: 'Username',
  })
  username: string

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email',
  })
  email: string
}

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

  @ApiPropertyOptional({
    type: CommentAuthorDto,
    description: 'Author information',
  })
  author?: CommentAuthorDto

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
