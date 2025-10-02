import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from './common/logger'
import { typeOrmConfig } from './config/typeorm.config'
import { HealthController } from './health/health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    TypeOrmModule.forRoot(typeOrmConfig),
  ],
  controllers: [HealthController],
})
export class AppModule {}
