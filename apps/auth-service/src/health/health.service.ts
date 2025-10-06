import { Injectable } from '@nestjs/common'
import { HealthResponseDto } from './dto/health-response.dto'

@Injectable()
export class HealthService {
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
    }
  }
}
