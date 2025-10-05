import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function TaskSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='h-6 w-3/4 animate-pulse rounded bg-muted' />
          <div className='flex gap-2'>
            <div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
            <div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='mb-4 space-y-2'>
          <div className='h-4 w-full animate-pulse rounded bg-muted' />
          <div className='h-4 w-2/3 animate-pulse rounded bg-muted' />
        </div>
        <div className='flex gap-4'>
          <div className='h-3 w-24 animate-pulse rounded bg-muted' />
          <div className='h-3 w-20 animate-pulse rounded bg-muted' />
        </div>
      </CardContent>
    </Card>
  )
}
