import { Injectable } from '@nestjs/common'
import { HealthResponseDto } from './health-response.dto'

@Injectable()
export abstract class BaseHealthService {
  constructor(
    protected readonly serviceName: string,
    protected readonly serviceVersion: string = '1.0.0',
  ) {}

  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      version: this.serviceVersion,
    }
  }
}
