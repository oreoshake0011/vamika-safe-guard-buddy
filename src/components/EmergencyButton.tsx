
import React, { useState, useEffect } from 'react';
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
  const [isSending, setIsSending] = useState(false);
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const sizes = {
    sm: "h-14 w-14 text-sm",
    md: "h-20 w-20 text-xl",
    lg: "h-28 w-28 text-2xl"
  };

  // Cleanup effect for timers
  useEffect(() => {
    return () => {
      if (holdTimer) {
        clearInterval(holdTimer);
      }
    };
  }, [holdTimer]);

  const handleMouseDown = () => {
    if (isSending) return;
    
    setIsActivating(true);
    setProgress(0);
    
    const startTime = Date.now();
    const timerDuration = 2000; // 2 seconds to activate
    
    const timer = setInterval(() => {
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
    
    if (!isSending) {
      setIsActivating(false);
      setProgress(0);
    }
  };
  
  const triggerSOS = async () => {
    if (isSending) return;
    
    try {
      setIsSending(true);
      toast({
        title: "SOS Activating",
        description: "Sending emergency notifications...",
      });
      
      console.log("Starting onActivate function");
      await onActivate();
      console.log("onActivate function completed");
      
      toast({
        title: "SOS Activated",
        description: "Emergency contacts have been notified.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error activating SOS:", error);
      toast({
        title: "Activation Failed",
        description: "Please try again or use alternative method.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      setIsActivating(false);
      setProgress(0);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        className={cn(
          "sos-button relative overflow-hidden rounded-full shadow-lg border-2 flex items-center justify-center",
          sizes[size],
          isActivating ? "bg-red-700 text-white border-red-500" : 
          isSending ? "bg-red-700 text-white border-red-500" : 
          "bg-red-600 text-white border-red-400 hover:bg-red-700",
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={isSending}
        aria-label="Emergency SOS button"
      >
        {isSending ? (
          <AlertCircle className="h-8 w-8 animate-pulse" />
        ) : isActivating ? (
          <AlertCircle className="h-8 w-8 animate-pulse" />
        ) : (
          <span className="font-bold">SOS</span>
        )}
        
        {isActivating && (
          <div 
            className="absolute bottom-0 left-0 h-2 bg-white"
            style={{ width: `${progress}%` }}
          />
        )}
      </button>
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm font-medium">
        {isSending ? 
          "Sending alerts..." : 
          isActivating ? 
            progress < 100 ? "Hold to activate" : "Activating..." : 
            ""}
      </div>
    </div>
  );
};

export default EmergencyButton;
