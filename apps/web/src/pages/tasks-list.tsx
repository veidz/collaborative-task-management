import { useState } from 'react'
import { Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTasks } from '@/hooks/use-tasks'
import { TaskStatus, TaskPriority, TaskFilters } from '@/types/task'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskSkeleton } from '@/components/tasks/task-skeleton'
import { EmptyState } from '@/components/tasks/empty-state'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function TasksListPage() {
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 12,
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data, isLoading, error } = useTasks(filters)
  const tasks = data?.data
  const meta = data?.meta

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === 'all' ? undefined : (value as TaskStatus),
      page: 1,
    }))
  }

  const handlePriorityFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      priority: value === 'all' ? undefined : (value as TaskPriority),
      page: 1,
    }))
  }

  const handleAssignedToMeToggle = () => {
    setFilters((prev) => ({
      ...prev,
      assignedToMe: !prev.assignedToMe,
      page: 1,
    }))
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 })
  }

  const handlePreviousPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max((prev.page || 1) - 1, 1),
    }))
  }

  const handleNextPage = () => {
    if (meta && (filters.page || 1) < meta.totalPages) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }))
    }
  }

  const hasActiveFilters =
    filters.status || filters.priority || filters.assignedToMe

  return (
    <div className='container mx-auto max-w-7xl p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Tasks</h1>
          <p className='text-muted-foreground'>Manage and track your tasks</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          New Task
        </Button>
      </div>

      <div className='mb-6 flex flex-wrap gap-4'>
        <Select
          onValueChange={handleStatusFilter}
          defaultValue='all'
          value={filters.status || 'all'}
        >
          <SelectTrigger className='w-[180px]'>
            <Filter className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
            <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={handlePriorityFilter}
          defaultValue='all'
          value={filters.priority || 'all'}
        >
          <SelectTrigger className='w-[180px]'>
            <Filter className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Priority' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Priority</SelectItem>
            <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
            <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
            <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
            <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={filters.assignedToMe ? 'default' : 'outline'}
          onClick={handleAssignedToMeToggle}
        >
          Assigned to Me
        </Button>

        {hasActiveFilters && (
          <Button onClick={clearFilters} variant='ghost'>
            Clear Filters
          </Button>
        )}
      </div>

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error loading tasks</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load tasks. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className='mt-8 flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                Page {meta.page} of {meta.totalPages} ({meta.total} total tasks)
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handlePreviousPage}
                  disabled={meta.page === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleNextPage}
                  disabled={meta.page === meta.totalPages}
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title='No tasks found'
          description={
            hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'
          }
        />
      )}

      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  )
}
