import { Injectable } from '@nestjs/common'
import { BaseHealthService } from '@packages/utils'

@Injectable()
export class HealthService extends BaseHealthService {
  constructor() {
    super('notifications-service', '1.0.0')
  }
}
