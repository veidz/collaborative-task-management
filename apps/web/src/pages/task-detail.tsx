import { useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  User,
  Clock,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { useTask, useDeleteTask } from '@/hooks/use-tasks'
import { useComments } from '@/hooks/use-comments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { StatusBadge } from '@/components/tasks/status-badge'
import { PriorityBadge } from '@/components/tasks/priority-badge'
import { EditTaskModal } from '@/components/tasks/edit-task-modal'
import { DeleteTaskDialog } from '@/components/tasks/delete-task-dialog'
import { CommentsSection } from '@/components/tasks/comments-section'

export function TaskDetailPage() {
  const { id } = useParams({ from: '/authenticated/tasks/$id' })
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: task, isLoading, error, refetch: refetchTask } = useTask(id)
  const {
    data: comments,
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments,
  } = useComments(id)
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()

  const handleDelete = () => {
    deleteTask(id, {
      onSuccess: () => {
        navigate({ to: '/tasks' })
      },
    })
  }

  const commentsList = Array.isArray(comments) ? comments : []

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-5xl p-6'>
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className='container mx-auto max-w-5xl p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load task. {error?.message}
          </AlertDescription>
        </Alert>
        <div className='mt-4 flex gap-2'>
          <Button onClick={() => refetchTask()}>Retry</Button>
          <Button variant='outline' asChild>
            <Link to='/tasks'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Tasks
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-5xl p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <Button variant='ghost' asChild>
          <Link to='/tasks'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Tasks
          </Link>
        </Button>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setIsEditModalOpen(true)}>
            <Edit className='mr-2 h-4 w-4' />
            Edit
          </Button>
          <Button
            variant='destructive'
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </Button>
        </div>
      </div>

      <Card className='mb-6'>
        <CardHeader>
          <div className='flex items-start justify-between gap-4'>
            <CardTitle className='text-3xl'>{task.title}</CardTitle>
            <div className='flex gap-2'>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h3 className='mb-2 font-semibold'>Description</h3>
            <p className='text-muted-foreground whitespace-pre-wrap'>
              {task.description || 'No description provided'}
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {task.deadline && (
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Deadline</p>
                  <p className='text-sm text-muted-foreground'>
                    {format(new Date(task.deadline), 'PPP p')}
                    <span className='ml-2 text-xs'>
                      (
                      {formatDistanceToNow(new Date(task.deadline), {
                        addSuffix: true,
                      })}
                      )
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>Created</p>
                <p className='text-sm text-muted-foreground'>
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                  {task.createdBy && ` by ${task.createdBy.username}`}
                </p>
              </div>
            </div>
          </div>

          {task.assignees && task.assignees.length > 0 && (
            <div>
              <div className='mb-2 flex items-center gap-2'>
                <User className='h-4 w-4 text-muted-foreground' />
                <h3 className='font-semibold'>Assigned To</h3>
              </div>
              <div className='flex flex-wrap gap-2'>
                {task.assignees.map((assignee) => (
                  <Badge key={assignee.id} variant='secondary'>
                    {assignee.username}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Comments ({commentsList.length})
            </CardTitle>
            {commentsError && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => refetchComments()}
              >
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {commentsError ? (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Failed to load comments. Click retry to try again.
              </AlertDescription>
            </Alert>
          ) : (
            <CommentsSection
              taskId={id}
              comments={commentsList}
              isLoading={isLoadingComments}
            />
          )}
        </CardContent>
      </Card>

      <EditTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        taskTitle={task.title}
      />
    </div>
  )
}
