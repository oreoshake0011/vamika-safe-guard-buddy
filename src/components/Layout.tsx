
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, Users, Map, Settings, Menu, X, Camera, MessageSquare, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';
import MobileNavbar from './MobileNavbar';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const isMobile = useMobile();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Safety Tools', path: '/safety', icon: Shield },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Safe Zones', path: '/zones', icon: Map },
    { name: 'Camera Scanner', path: '/camera-scan', icon: Camera },
    { name: 'Incident Reports', path: '/incident-feed', icon: AlertTriangle },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];
  
  const toggleNav = () => setIsOpen(!isOpen);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile header */}
      {isMobile && (
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary text-xl">
            <Shield className="h-6 w-6" />
            <span>Vamika</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleNav} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </header>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigation */}
        <nav className={cn(
          "bg-card border-r z-20 transition-all duration-300 flex flex-col",
          isMobile ? 
            isOpen ? "fixed inset-y-0 right-0 w-64" : "fixed inset-y-0 right-0 w-0 -translate-x-full" : 
            "w-64 relative"
        )}>
          {!isMobile && (
            <div className="p-6 border-b">
              <Link to="/" className="flex items-center gap-2 font-bold text-primary text-xl">
                <Shield className="h-6 w-6" />
                <span>Vamika</span>
              </Link>
            </div>
          )}
          
          <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-item",
                  location.pathname === item.path && "nav-item-active"
                )}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          
          {/* SOS Button in sidebar */}
          <div className="p-4 border-t">
            <Link to="/sos" className="sos-button py-3 w-full text-lg">
              SOS Emergency
            </Link>
          </div>
        </nav>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto relative pb-16 md:pb-0">
          <div className="container py-6 px-4 max-w-5xl mx-auto">
            {children}
          </div>
          
          {/* Floating SOS button for mobile */}
          {isMobile && (
            <div className="fixed bottom-20 right-0 left-0 z-10 flex justify-center">
              <Link to="/sos" className="sos-button h-16 w-16 text-xl animate-pulse-soft">
                SOS
              </Link>
            </div>
          )}
        </main>
      </div>
      
      {/* Mobile bottom navbar */}
      {isMobile && <MobileNavbar />}
    </div>
  );
};

export default Layout;
