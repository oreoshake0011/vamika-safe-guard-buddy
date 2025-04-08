
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EmergencyButtonProps {
  onActivate: () => Promise<void>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  onActivate,
  className,
  size = 'md',
}) => {
  const [isActivating, setIsActivating] = useState(false);
  const [holdTimer, setHoldTimer] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const sizes = {
    sm: "h-14 w-14 text-sm",
    md: "h-20 w-20 text-xl",
    lg: "h-28 w-28 text-2xl"
  };

  const handleMouseDown = () => {
    setIsActivating(true);
    setProgress(0);
    
    const startTime = Date.now();
    const timerDuration = 2000; // 2 seconds to activate
    
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / timerDuration) * 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(timer);
        triggerSOS();
      }
    }, 50);
    
    setHoldTimer(timer);
  };

  const handleMouseUp = () => {
    if (holdTimer !== null) {
      clearInterval(holdTimer);
      setHoldTimer(null);
    }
    setIsActivating(false);
    setProgress(0);
  };
  
  const triggerSOS = async () => {
    try {
      await onActivate();
      toast({
        title: "SOS Activated",
        description: "Emergency contacts are being notified.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Activation Failed",
        description: "Please try again or use alternative method.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        className={cn(
          "sos-button relative overflow-hidden",
          sizes[size],
          isActivating && "bg-red-700"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {isActivating ? (
          <AlertCircle className="h-6 w-6 animate-pulse" />
        ) : (
          "SOS"
        )}
        
        {isActivating && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-white"
            style={{ width: `${progress}%` }}
          />
        )}
      </button>
      
      {isActivating && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm font-medium">
          {progress < 100 ? "Hold to activate" : "Activating..."}
        </div>
      )}
    </div>
  );
};

export default EmergencyButton;
