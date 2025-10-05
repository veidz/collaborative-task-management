import { apiClient } from './api-client'
import {
  Task,
  Comment,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCommentRequest,
  TaskFilters,
} from '@/types/task'

export const taskApi = {
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId)
    if (filters?.search) params.append('search', filters.search)

    const { data } = await apiClient.get<Task[]>(
      `/tasks${params.toString() ? `?${params.toString()}` : ''}`,
    )
    return data
  },

  getTask: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`)
    return data
  },

  createTask: async (taskData: CreateTaskRequest): Promise<Task> => {
    const { data } = await apiClient.post<Task>('/tasks', taskData)
    return data
  },

  updateTask: async (
    id: string,
    taskData: UpdateTaskRequest,
  ): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, taskData)
    return data
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`)
  },

  getComments: async (taskId: string): Promise<Comment[]> => {
    const { data } = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments`)
    return data
  },

  createComment: async (
    taskId: string,
    commentData: CreateCommentRequest,
  ): Promise<Comment> => {
    const { data } = await apiClient.post<Comment>(
      `/tasks/${taskId}/comments`,
      commentData,
    )
    return data
  },
}
