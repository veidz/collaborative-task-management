import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from './common/logger'
import { HealthModule } from './health/health.module'
import typeormConfig from './config/typeorm.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...typeormConfig.options,
    }),
    LoggerModule,
    HealthModule,
  ],
})
export class AppModule {}
