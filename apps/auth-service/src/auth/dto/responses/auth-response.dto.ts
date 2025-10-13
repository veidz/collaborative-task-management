import { ApiProperty } from '@nestjs/swagger'
import { UserDataDto } from './user-data.dto'

export class AuthResponseDto {
  @ApiProperty({ type: UserDataDto })
  user: UserDataDto

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
