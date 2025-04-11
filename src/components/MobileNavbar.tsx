
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Shield, MapPin, Phone, AlarmCheck, BadgeInfo, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMobile();
  const isActive = (path: string) => location.pathname === path;

  if (!isMobile) return null;

  const menuItems = [
    { icon: Home, path: '/', auth: false },
    { icon: Shield, path: '/safety', auth: true },
    { icon: MapPin, path: '/zones', auth: true },
    { icon: Phone, path: '/emergency-contacts', auth: true },
    { icon: AlarmCheck, path: '/sos', auth: true },
    { icon: BadgeInfo, path: '/feed', auth: true },
    { icon: User, path: '/profile', auth: true },
  ];

  // Filter menu items based on authentication status
  const filteredMenuItems = menuItems.filter(item => !item.auth || (item.auth && user));

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background z-50 border-t">
      <ul className="flex justify-around p-2">
        {filteredMenuItems.map(item => (
          <li key={item.path}>
            <Link to={item.path} className="flex flex-col items-center">
              <item.icon className={cn("h-6 w-6", isActive(item.path) ? 'text-primary' : 'text-muted-foreground')} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileNavbar;
