import { useWebSocket } from '@/hooks/use-websocket'
import { Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function WebSocketStatus() {
  const { isConnected } = useWebSocket()

  return (
    <Badge
      variant={isConnected ? 'default' : 'destructive'}
      className='gap-1.5'
    >
      {isConnected ? (
        <>
          <Wifi className='h-3 w-3' />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className='h-3 w-3' />
          <span>Disconnected</span>
        </>
      )}
    </Badge>
  )
}
