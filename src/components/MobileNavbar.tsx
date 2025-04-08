
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, Users, Map, Settings, Camera, MessageSquare, AlertTriangle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNavbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Safety', path: '/safety', icon: Shield },
    { name: 'Scan', path: '/camera-scan', icon: Camera },
    { name: 'Alerts', path: '/incident-feed', icon: AlertTriangle },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center py-3 px-2 flex-1 text-xs",
              location.pathname === item.path 
                ? "text-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavbar;
