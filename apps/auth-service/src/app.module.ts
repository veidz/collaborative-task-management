import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from './common/logger'
import { typeOrmConfig } from './config/typeorm.config'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    HealthModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
