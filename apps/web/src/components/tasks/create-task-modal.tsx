import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCreateTask } from '@/hooks/use-tasks'
import { useAuth } from '@/hooks/use-auth'
import { createTaskSchema, CreateTaskFormData } from '@/lib/validations/task'
import { TaskStatus, TaskPriority } from '@/types/task'
import { ApiErrorResponse } from '@/types/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    TaskStatus.TODO,
  )
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>(
    TaskPriority.MEDIUM,
  )
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  const { mutate: createTask, isPending, error } = useCreateTask()
  const { users, isLoadingUsers } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeIds: [],
    },
  })

  const onSubmit = (data: CreateTaskFormData) => {
    createTask(
      {
        title: data.title,
        description: data.description,
        status: selectedStatus,
        priority: selectedPriority,
        deadline: data.deadline || undefined,
        assigneeIds: selectedAssignees,
      },
      {
        onSuccess: () => {
          reset()
          setSelectedStatus(TaskStatus.TODO)
          setSelectedPriority(TaskPriority.MEDIUM)
          setSelectedAssignees([])
          onOpenChange(false)
        },
      },
    )
  }

  const handleClose = () => {
    if (!isPending) {
      reset()
      setSelectedStatus(TaskStatus.TODO)
      setSelectedPriority(TaskPriority.MEDIUM)
      setSelectedAssignees([])
      onOpenChange(false)
    }
  }

  const handleAssigneeToggle = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    )
  }

  const getErrorMessage = () => {
    if (!error) return null
    const axiosError = error as AxiosError<ApiErrorResponse>
    const message = axiosError.response?.data?.message
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    return message || 'Failed to create task'
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{getErrorMessage()}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='title'>
              Title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='title'
              placeholder='Enter task title'
              {...register('title')}
              disabled={isPending}
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Enter task description'
              rows={4}
              {...register('description')}
              disabled={isPending}
            />
            {errors.description && (
              <p className='text-sm text-destructive'>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as TaskStatus)
                }
                disabled={isPending}
              >
                <SelectTrigger id='status'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                  <SelectItem value={TaskStatus.CANCELLED}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='priority'>Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) =>
                  setSelectedPriority(value as TaskPriority)
                }
                disabled={isPending}
              >
                <SelectTrigger id='priority'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                  <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='deadline'>Deadline</Label>
            <Input
              id='deadline'
              type='datetime-local'
              {...register('deadline')}
              disabled={isPending}
            />
            {errors.deadline && (
              <p className='text-sm text-destructive'>
                {errors.deadline.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label>Assign To</Label>
            {isLoadingUsers ? (
              <p className='text-sm text-muted-foreground'>Loading users...</p>
            ) : users && users.length > 0 ? (
              <div className='space-y-2 rounded-md border p-4 max-h-40 overflow-y-auto'>
                {users.map((user) => (
                  <div key={user.id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`assignee-${user.id}`}
                      checked={selectedAssignees.includes(user.id)}
                      onCheckedChange={() => handleAssigneeToggle(user.id)}
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={`assignee-${user.id}`}
                      className='flex-1 cursor-pointer text-sm font-normal'
                    >
                      {user.username} ({user.email})
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>
                No users available
              </p>
            )}
            {selectedAssignees.length > 0 && (
              <p className='text-xs text-muted-foreground'>
                {selectedAssignees.length} user(s) selected
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
