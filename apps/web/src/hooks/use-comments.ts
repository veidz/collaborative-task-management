import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/lib/task-api'
import { CreateCommentRequest } from '@/types/task'

export function useComments(taskId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['tasks', taskId, 'comments', page, limit],
    queryFn: () => taskApi.getComments(taskId, page, limit),
    enabled: !!taskId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    select: (data) => data.data,
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
