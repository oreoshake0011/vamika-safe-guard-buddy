
import React from 'react';
import { cn } from '@/lib/utils';

interface SafetyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const SafetyCard: React.FC<SafetyCardProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn("card-safety", className)}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {action && (
            <button 
              onClick={action.onClick}
              className="mt-3 text-primary font-medium text-sm hover:underline focus:outline-none"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyCard;
