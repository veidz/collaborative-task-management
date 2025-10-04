import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from './common/logger'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { TasksModule } from './tasks/tasks.module'
import servicesConfig from './config/services.config'
import { NotificationsModule } from './notifications/notifications.module'
import { CommentsModule } from './comments/comments.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [servicesConfig],
    }),
    LoggerModule,
    HealthModule,
    AuthModule,
    TasksModule,
    CommentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
