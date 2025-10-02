import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-10-02T00:28:03.000Z' },
        service: { type: 'string', example: 'auth-service' },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  async check() {
    const dbStatus = this.dataSource.isInitialized
      ? 'connected'
      : 'disconnected'

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      database: dbStatus,
    }
  }
}
