
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { XCircle, MapPin, Bell, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { useSOS } from '@/hooks/useSOS';
import { supabase } from '@/integrations/supabase/client';

const SOSPage = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: 'Locating...' });
  const [customMessage, setCustomMessage] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [autoTriggering, setAutoTriggering] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { user } = useAuth();
  const { isLoading, currentSOSEvent, cancelSOS, sendCustomMessage, checkForActiveSOSEvent, triggerSOS } = useSOS();

  // Check URL parameters for auto-trigger flag
  useEffect(() => {
    const queryParams = new URLSearchParams(locationHook.search);
    const autoTrigger = queryParams.get('autoTrigger') === 'true';
    
    if (autoTrigger && !currentSOSEvent && !autoTriggering) {
      setAutoTriggering(true);
      // Short delay to allow the app to initialize
      setTimeout(() => {
        handleAutoTriggerSOS();
      }, 1000);
    }
  }, [locationHook.search, currentSOSEvent]);

  // Check for active SOS on page load and setup timer
  useEffect(() => {
    checkForActiveSOSEvent();
    
    // Try to get user's location (simplified - in a real app use Geolocation API)
    setTimeout(() => {
      setLocation({
        lat: 40.7128,
        lng: -74.0060,
        address: '123 Safety Street, New York, NY 10001'
      });
    }, 1500);
    
    // Fetch emergency contacts if user is logged in
    if (user) {
      fetchEmergencyContacts();
    }
  }, [user]);
  
  // Setup timer for active SOS event
  useEffect(() => {
    console.log("Current SOS event:", currentSOSEvent);
    
    // Start timer for active SOS event
    if (currentSOSEvent && currentSOSEvent.status === 'active') {
      console.log("Setting up timer for active SOS");
      const timer = setInterval(() => {
        const start = new Date(currentSOSEvent.initiated_at).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentSOSEvent]);

  const fetchEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('priority', { ascending: true })
        .limit(3);

      if (error) {
        throw error;
      }

      setEmergencyContacts(data || []);
      console.log("Fetched emergency contacts:", data);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    }
  };

  const handleAutoTriggerSOS = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to use the SOS feature.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Auto-triggering SOS",
        description: "Sending emergency alert...",
      });

      // Get current location (this is a simplified example)
      const currentLocation = {
        address: "Auto-detected location",
        latitude: 40.7128,
        longitude: -74.0060
      };

      await triggerSOS(currentLocation);
    } catch (error) {
      console.error("Error auto-triggering SOS:", error);
      toast({
        title: "SOS Error",
        description: "Failed to trigger SOS automatically",
        variant: "destructive"
      });
    } finally {
      setAutoTriggering(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancelSOS = async () => {
    if (currentSOSEvent) {
      const result = await cancelSOS(currentSOSEvent.id);
      if (result.success) {
        setTimeout(() => navigate('/'), 1500);
      }
    }
  };

  const handleSendCustomMessage = async () => {
    if (!currentSOSEvent || !customMessage.trim()) return;
    
    setIsSendingMessage(true);
    try {
      const result = await sendCustomMessage(currentSOSEvent.id, customMessage);
      if (result.success) {
        setCustomMessage('');
        toast({
          title: "Message Sent",
          description: "Your message has been sent to your emergency contacts."
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error sending custom message:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (!currentSOSEvent) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-muted/30 p-6 rounded-lg mb-6">
            <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Active SOS</h1>
            <p className="text-muted-foreground mb-6">
              {autoTriggering 
                ? "Initiating emergency alert..." 
                : "There is currently no active emergency alert."}
            </p>
            <Button 
              className="w-full"
              onClick={() => navigate('/')}
              disabled={autoTriggering}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isActive = currentSOSEvent.status === 'active';

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className={`p-6 rounded-xl border-2 ${isActive ? 'border-destructive bg-destructive/5' : 'border-border'} mb-6`}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {isActive ? 'SOS Active' : 'SOS Deactivated'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isActive 
                ? 'Your emergency contacts are being notified with your location' 
                : 'Your alert has been cancelled'}
            </p>
          </div>
          
          {isActive && (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
              </div>
              
              <div className="bg-background rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Current Location</p>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium">Notifying Contacts:</p>
                {emergencyContacts.length > 0 ? (
                  emergencyContacts.map(contact => (
                    <div key={contact.id} className="flex items-center gap-2 bg-background rounded-lg p-3">
                      <Bell className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone_number}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">No emergency contacts found</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Type a custom message to your contacts..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={handleSendCustomMessage}
                  disabled={!customMessage.trim() || isSendingMessage}
                >
                  {isSendingMessage ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancelSOS}
                disabled={isLoading}
              >
                <XCircle className="h-5 w-5 mr-2" />
                {isLoading ? "Processing..." : "Cancel SOS"}
              </Button>
            </>
          )}
        </div>
        
        {!isActive && (
          <Button 
            className="w-full"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        )}
      </div>
    </Layout>
  );
};

export default SOSPage;
