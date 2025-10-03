import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator'
import { Type, Transform } from 'class-transformer'

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10

  @ApiPropertyOptional({
    description: 'Filter by unread only',
    example: false,
    default: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean = false
}
