import { apiClient } from './api-client'
import {
  Task,
  Comment,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCommentRequest,
  TaskFilters,
  PaginatedResponse,
  PaginatedCommentsResponse,
  AssignUsersRequest,
  UnassignUsersRequest,
} from '@/types/task'

export const taskApi = {
  getTasks: async (filters?: TaskFilters): Promise<PaginatedResponse<Task>> => {
    const params = new URLSearchParams()

    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.assignedToMe !== undefined) {
      params.append('assignedToMe', String(filters.assignedToMe))
    }
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    const { data } = await apiClient.get<PaginatedResponse<Task>>(
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
    const { data } = await apiClient.put<Task>(`/tasks/${id}`, taskData)
    return data
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`)
  },

  getComments: async (
    taskId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedCommentsResponse> => {
    const { data } = await apiClient.get<PaginatedCommentsResponse>(
      `/tasks/${taskId}/comments?page=${page}&limit=${limit}`,
    )
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

  assignUsers: async (
    id: string,
    assignData: AssignUsersRequest,
  ): Promise<Task> => {
    const { data } = await apiClient.post<Task>(
      `/tasks/${id}/assign`,
      assignData,
    )
    return data
  },

  unassignUsers: async (
    id: string,
    unassignData: UnassignUsersRequest,
  ): Promise<Task> => {
    const { data } = await apiClient.post<Task>(
      `/tasks/${id}/unassign`,
      unassignData,
    )
    return data
  },
}
