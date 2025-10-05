import { FileText } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <FileText className='mb-4 h-12 w-12 text-muted-foreground' />
      <h3 className='mb-2 text-lg font-semibold'>{title}</h3>
      <p className='text-sm text-muted-foreground'>{description}</p>
    </div>
  )
}
