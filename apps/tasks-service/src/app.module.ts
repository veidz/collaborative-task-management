import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from './common/logger'
import { HealthModule } from './health/health.module'
import { TasksModule } from './tasks/tasks.module'
import typeormConfig from './config/typeorm.config'
import { CommentsModule } from './comments/comments.module'
import { EventsModule } from './events/events.module'
import { AuthModule } from './common/auth/auth.module'

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
    AuthModule,
    TasksModule,
    CommentsModule,
    EventsModule,
  ],
})
export class AppModule {}
