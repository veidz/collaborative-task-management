import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator'

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'johndoe',
    description: 'Username (3-30 characters)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string

  @ApiProperty({
    example: 'Password123!',
    description:
      'Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string
}
