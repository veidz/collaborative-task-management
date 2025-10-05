import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/lib/task-api'
import { CreateCommentRequest } from '@/types/task'

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'comments'],
    queryFn: () => taskApi.getComments(taskId),
    enabled: !!taskId,
  })
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      taskApi.createComment(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'comments'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}
