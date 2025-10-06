import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Notification } from '@/types/notification'

interface PaginatedNotifications {
  data: Notification[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface UnreadCount {
  count: number
}

export function useNotifications(page = 1, limit = 10, unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', page, limit, unreadOnly],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedNotifications>(
        '/notifications',
        {
          params: { page, limit, unreadOnly },
        },
      )
      return data
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await apiClient.get<UnreadCount>(
        '/notifications/unread-count',
      )
      return data
    },
    refetchInterval: 30000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiClient.put<Notification>(
        `/notifications/${notificationId}/read`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.put<{ updated: number }>(
        '/notifications/read-all',
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}
