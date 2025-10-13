import { ApiProperty } from '@nestjs/swagger'

export class UserDataDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string

  @ApiProperty({ example: 'user@example.com' })
  email: string

  @ApiProperty({ example: 'johndoe' })
  username: string

  @ApiProperty({ example: '2025-10-02T17:26:16.000Z' })
  createdAt: Date
}
