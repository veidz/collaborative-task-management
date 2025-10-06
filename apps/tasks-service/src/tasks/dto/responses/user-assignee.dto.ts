import { ApiProperty } from '@nestjs/swagger'

export class UserAssigneeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier',
  })
  id: string

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email',
  })
  email: string

  @ApiProperty({
    example: 'johndoe',
    description: 'Username',
  })
  username: string

  @ApiProperty({
    example: '2025-10-04T00:43:57.000Z',
    description: 'Assignment timestamp',
  })
  assignedAt: Date

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User who assigned',
  })
  assignedBy: string
}
