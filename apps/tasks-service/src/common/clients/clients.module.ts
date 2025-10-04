import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { AuthServiceClient } from './auth-service.client'

@Module({
  imports: [HttpModule],
  providers: [AuthServiceClient],
  exports: [AuthServiceClient],
})
export class ClientsModule {}
