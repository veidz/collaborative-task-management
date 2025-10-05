import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/lib/task-api'
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignUsersRequest,
  UnassignUsersRequest,
  TaskFilters,
} from '@/types/task'

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskApi.getTasks(filters),
    staleTime: 1000 * 30,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.getTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTaskRequest) => taskApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useAssignUsers(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AssignUsersRequest) => taskApi.assignUsers(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })
}

export function useUnassignUsers(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UnassignUsersRequest) => taskApi.unassignUsers(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })
}
