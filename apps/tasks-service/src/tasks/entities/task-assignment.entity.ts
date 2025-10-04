import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm'
import { Task } from './task.entity'

@Entity('task_assignments')
@Index(['taskId', 'userId'], { unique: true })
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('uuid', { name: 'task_id' })
  @Index()
  taskId: string

  @Column('uuid', { name: 'user_id' })
  @Index()
  userId: string

  @Column('uuid', { name: 'assigned_by' })
  assignedBy: string

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date

  @ManyToOne(() => Task, (task) => task.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task
}
