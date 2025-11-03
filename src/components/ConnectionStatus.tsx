import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ConnectionStatus = () => {
  const { connected } = useSocket();
  const [showAlert, setShowAlert] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (!connected) {
      setShowAlert(true);
      setIsReconnecting(true);
    } else {
      // Hide alert after successful reconnection
      if (isReconnecting) {
        setTimeout(() => {
          setShowAlert(false);
          setIsReconnecting(false);
        }, 2000);
      }
    }
  }, [connected, isReconnecting]);

  // Don't show anything if connected and not reconnecting
  if (connected && !showAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
      {!connected ? (
        <Alert variant="destructive" className="glass border-destructive/50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Connection lost. Reconnecting...
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="glass border-green-500/50 bg-green-500/10">
          <Wifi className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Connected successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
