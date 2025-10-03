import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm'

export enum NotificationType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  COMMENT_CREATED = 'COMMENT_CREATED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('uuid', { name: 'user_id' })
  @Index()
  userId: string

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType

  @Column('text')
  message: string

  @Column({ default: false })
  read: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
