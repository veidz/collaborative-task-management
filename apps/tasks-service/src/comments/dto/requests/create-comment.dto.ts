import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator'

export class CreateCommentDto {
  @ApiProperty({
    example: 'This task looks great!',
    description: 'Comment content',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string
}
