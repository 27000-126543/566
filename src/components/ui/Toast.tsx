import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useAppStore } from '@/store/index.js';

export function Toast() {
  const { notification, setNotification } = useAppStore();
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);
  
  if (!notification) return null;
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };
  
  const bgColors = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColors[notification.type]} backdrop-blur-md shadow-lg min-w-[280px]`}
      >
        {icons[notification.type]}
        <p className="flex-1 text-game-text font-medium">{notification.message}</p>
        <button
          onClick={() => setNotification(null)}
          className="text-game-subtext hover:text-game-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
