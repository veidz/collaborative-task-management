import { z } from 'zod'
import { TaskStatus, TaskPriority } from '@/types/task'

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  deadline: z.string().optional(),
  assigneeIds: z.array(z.string().uuid()).default([]),
})

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  deadline: z.string().optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
})

export const assignUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'At least one user required'),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500),
})

export type CreateTaskFormData = z.infer<typeof createTaskSchema>
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>
export type AssignUsersFormData = z.infer<typeof assignUsersSchema>
export type CreateCommentFormData = z.infer<typeof createCommentSchema>
