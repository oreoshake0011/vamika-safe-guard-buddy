
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import SafetyCard from '@/components/SafetyCard';
import EmergencyButton from '@/components/EmergencyButton';
import { Shield, Users, Map, Bell, Phone, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useSOS } from '@/hooks/useSOS';

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { triggerSOS, sendCheckInMessage } = useSOS();
  const [safetyTips, setSafetyTips] = useState<string[]>([
    "Share your location with trusted contacts when traveling alone",
    "Stay in well-lit, populated areas when out at night",
    "Trust your instincts - if something feels wrong, it probably is",
    "Keep emergency contacts easily accessible on your phone"
  ]);
  const [showAllTips, setShowAllTips] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleEmergency = async () => {
    try {
      console.log("SOS button pressed, triggering emergency...");
      // Use default Dehradun coordinates
      const defaultLocation = {
        address: "Dehradun, India",
        latitude: 30.2724,
        longitude: 78.0010
      };
      
      const result = await triggerSOS(defaultLocation);
      console.log("SOS trigger result:", result);
      
      if (result.success) {
        navigate('/sos');
      } else {
        toast({
          title: "SOS Error",
          description: result.error || "Failed to activate SOS",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error triggering SOS:", error);
      toast({
        title: "SOS Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCheckIn = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to use the check-in feature.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCheckingIn(true);
    try {
      console.log("Sending check-in message...");
      const result = await sendCheckInMessage();
      console.log("Check-in result:", result);
      
      if (result.success) {
        toast({
          title: "Safety Check",
          description: "You've been marked safe. Your contacts have been notified.",
        });
      } else {
        toast({
          title: "Check-In Error",
          description: result.error || "Failed to send check-in message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      toast({
        title: "Check-In Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleSafetyTip = () => {
    const newTip = "Always be aware of your surroundings and avoid distractions like texting while walking";
    setSafetyTips([...safetyTips, newTip]);
    toast({
      title: "New Safety Tip Added",
      description: "Check out your updated safety tips.",
    });
  };

  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || '';
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <section className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-2">Welcome{user ? `, ${getUserName()}` : ' to Vamika'}</h1>
          <p className="text-muted-foreground">Your personal safety companion</p>
          
          {user ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                logout();
                toast({ 
                  title: "Logged out", 
                  description: "You've been successfully logged out." 
                });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate('/login')}
            >
              Log In / Sign Up
            </Button>
          )}
        </section>

        <section className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="text-center flex-1 max-w-xs">
            <p className="text-sm text-muted-foreground mb-4">Press and hold for emergency</p>
            <div className="flex justify-center">
              <EmergencyButton 
                onActivate={handleEmergency}
                size="lg"
                className="mx-auto mb-2"
              />
            </div>
          </div>
          
          <div className="border-t sm:border-l sm:border-t-0 h-24 sm:h-40 mx-4" />
          
          <div className="flex-1 space-y-2 max-w-xs">
            <h2 className="font-semibold text-lg">Quick Actions</h2>
            <button 
              onClick={() => navigate('/contacts')}
              className="w-full flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-left"
            >
              <Phone className="h-5 w-5" />
              <span>Call Emergency Contact</span>
            </button>
            <button 
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="w-full flex items-center gap-3 p-3 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors text-left disabled:opacity-50"
            >
              <Bell className="h-5 w-5" />
              {isCheckingIn ? (
                <span className="flex items-center">
                  <span className="mr-2">Checking in...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                </span>
              ) : (
                <span>Check In (I'm Safe)</span>
              )}
            </button>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Safety Tips</h2>
            <Button variant="ghost" size="sm" onClick={handleSafetyTip}>Add Tip</Button>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <ul className="space-y-2">
              {safetyTips.slice(0, showAllTips ? safetyTips.length : 3).map((tip, index) => (
                <li key={index} className="flex items-start gap-2 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            {safetyTips.length > 3 && (
              <Button 
                variant="link" 
                className="mt-2 p-0"
                onClick={() => setShowAllTips(!showAllTips)}
              >
                {showAllTips ? "Show Less" : `Show ${safetyTips.length - 3} More Tips`}
              </Button>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          <SafetyCard
            title="Safety Tools"
            description="Access personal safety features including SOS alerts and safety check."
            icon={<Shield className="h-5 w-5" />}
            action={{
              label: "Open Safety Tools",
              onClick: () => navigate('/safety')
            }}
          />
          
          <SafetyCard
            title="Emergency Contacts"
            description="Manage your emergency contacts who will be alerted in case of danger."
            icon={<Users className="h-5 w-5" />}
            action={{
              label: "Manage Contacts",
              onClick: () => navigate('/contacts')
            }}
          />
          
          <SafetyCard
            title="Safe Zones"
            description="View and manage your safe locations and get directions to nearest ones."
            icon={<Map className="h-5 w-5" />}
            action={{
              label: "View Safe Zones",
              onClick: () => navigate('/zones')
            }}
          />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
