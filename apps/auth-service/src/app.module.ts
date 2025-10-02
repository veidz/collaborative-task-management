import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from '@packages/logger'
import { typeOrmConfig } from './config/typeorm.config'
import { HealthController } from './health/health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    LoggerModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
