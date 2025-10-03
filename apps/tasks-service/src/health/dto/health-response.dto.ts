import { ApiProperty } from '@nestjs/swagger'

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    description: 'Health status',
  })
  status: string

  @ApiProperty({
    example: '2025-10-02T23:10:07.000Z',
    description: 'Current timestamp',
  })
  timestamp: string

  @ApiProperty({
    example: 'tasks-service',
    description: 'Service name',
  })
  service: string

  @ApiProperty({
    example: '1.0.0',
    description: 'Service version',
  })
  version: string
}
