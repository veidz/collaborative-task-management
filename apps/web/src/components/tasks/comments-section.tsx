import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react'
import { useCreateComment } from '@/hooks/use-comments'
import {
  createCommentSchema,
  CreateCommentFormData,
} from '@/lib/validations/task'
import { Comment } from '@/types/task'
import { ApiErrorResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface CommentsSectionProps {
  taskId: string
  comments: Comment[]
  isLoading: boolean
}

export function CommentsSection({
  taskId,
  comments,
  isLoading,
}: CommentsSectionProps) {
  const { mutate: createComment, isPending, error } = useCreateComment(taskId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
  })

  const onSubmit = (data: CreateCommentFormData) => {
    createComment(data, {
      onSuccess: () => {
        reset()
      },
    })
  }

  const getErrorMessage = () => {
    if (!error) return null
    const axiosError = error as AxiosError<ApiErrorResponse>
    const message = axiosError.response?.data?.message
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    return message || 'Failed to add comment'
  }

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const commentsList = Array.isArray(comments) ? comments : []

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{getErrorMessage()}</AlertDescription>
          </Alert>
        )}

        <Textarea
          placeholder='Add a comment...'
          rows={3}
          {...register('content')}
          disabled={isPending}
        />
        {errors.content && (
          <p className='text-sm text-destructive'>{errors.content.message}</p>
        )}

        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending} size='sm'>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Send className='mr-2 h-4 w-4' />
            Comment
          </Button>
        </div>
      </form>

      <div className='space-y-4'>
        {commentsList.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <MessageSquare className='mb-2 h-8 w-8 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          commentsList.map((comment) => (
            <div key={comment.id} className='flex gap-3'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback className='text-xs'>
                  {comment.author ? getInitials(comment.author.username) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-semibold'>
                    {comment.author?.username || 'Unknown'}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
