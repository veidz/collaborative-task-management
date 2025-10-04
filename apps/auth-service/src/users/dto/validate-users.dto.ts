import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsUUID, ArrayMinSize } from 'class-validator'

export class ValidateUsersDto {
  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description: 'Array of user IDs to validate',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  userIds: string[]
}
