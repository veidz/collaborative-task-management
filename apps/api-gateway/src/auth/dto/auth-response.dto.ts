import { ApiProperty } from '@nestjs/swagger'

export class AuthResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier',
  })
  id: string

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string

  @ApiProperty({
    example: 'johndoe',
    description: 'Username',
  })
  username: string

  @ApiProperty({
    example: '2025-10-02T20:43:11.000Z',
    description: 'Account creation timestamp',
  })
  createdAt: Date
}
