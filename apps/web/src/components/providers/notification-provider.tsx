import { ReactNode } from 'react'
import { useNotificationToast } from '@/hooks/use-notification-toast'

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  useNotificationToast()
  return <>{children}</>
}
