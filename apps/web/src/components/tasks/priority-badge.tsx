import { TaskPriority } from '@/types/task'
import { Badge } from '@/components/ui/badge'

interface PriorityBadgeProps {
  priority: TaskPriority
}

const priorityConfig = {
  [TaskPriority.LOW]: {
    label: 'Low',
    variant: 'secondary' as const,
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    variant: 'warning' as const,
  },
  [TaskPriority.HIGH]: {
    label: 'High',
    variant: 'destructive' as const,
  },
  [TaskPriority.URGENT]: {
    label: 'Urgent',
    variant: 'destructive' as const,
  },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
