import { TaskStatus } from '@/types/task'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: TaskStatus
}

const statusConfig = {
  [TaskStatus.TODO]: {
    label: 'To Do',
    variant: 'outline' as const,
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    variant: 'info' as const,
  },
  [TaskStatus.DONE]: {
    label: 'Done',
    variant: 'success' as const,
  },
  [TaskStatus.CANCELLED]: {
    label: 'Cancelled',
    variant: 'secondary' as const,
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
