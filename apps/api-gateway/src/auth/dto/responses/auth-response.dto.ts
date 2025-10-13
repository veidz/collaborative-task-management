import { ApiProperty } from '@nestjs/swagger'

class UserData {
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

export class AuthResponseDto {
  @ApiProperty({ type: UserData })
  user: UserData

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token (expires in 15 minutes)',
  })
  accessToken: string

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token (expires in 7 days)',
  })
  refreshToken: string
}
