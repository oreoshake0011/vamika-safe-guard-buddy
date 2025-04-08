
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Shield, MapPin, Phone, AlarmCheck, BadgeInfo, Settings, User } from 'lucide-react';
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
    { icon: Home, label: 'Home', path: '/', auth: false },
    { icon: Shield, label: 'Safety', path: '/safety', auth: true },
    { icon: MapPin, label: 'Zones', path: '/zones', auth: true },
    { icon: Phone, label: 'Emergency', path: '/emergency-contacts', auth: true },
    { icon: AlarmCheck, label: 'SOS', path: '/sos', auth: true },
    { icon: BadgeInfo, label: 'Incidents', path: '/feed', auth: true },
    { icon: Settings, label: 'Settings', path: '/settings', auth: true },
    { icon: User, label: 'Profile', path: '/profile', auth: true },
  ];

  // Filter menu items based on authentication status
  const filteredMenuItems = menuItems.filter(item => !item.auth || (item.auth && user));

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-secondary z-50 border-t">
      <ul className="flex justify-around p-2">
        {filteredMenuItems.map(item => (
          <li key={item.label}>
            <Link to={item.path} className="flex flex-col items-center">
              <item.icon className={cn("h-6 w-6", isActive(item.path) ? 'text-primary' : 'text-muted-foreground')} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileNavbar;
