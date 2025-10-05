import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, MessageSquare, User } from 'lucide-react'
import { Task } from '@/types/task'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { PriorityBadge } from './priority-badge'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Link to={`/tasks/${task.id}`} className='block'>
      <Card className='transition-colors hover:bg-accent'>
        <CardHeader>
          <div className='flex items-start justify-between gap-2'>
            <CardTitle className='text-lg'>{task.title}</CardTitle>
            <div className='flex gap-2'>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='mb-4 line-clamp-2 text-sm text-muted-foreground'>
            {task.description}
          </p>

          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
            {task.deadline && (
              <div className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                <span>
                  Due{' '}
                  {formatDistanceToNow(new Date(task.deadline), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}

            {task.assignees && task.assignees.length > 0 && (
              <div className='flex items-center gap-1'>
                <User className='h-3 w-3' />
                <span>{task.assignees.length} assigned</span>
              </div>
            )}

            {task._count && task._count.comments > 0 && (
              <div className='flex items-center gap-1'>
                <MessageSquare className='h-3 w-3' />
                <span>{task._count.comments}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
