
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/schema';

export interface SOSEvent {
  id: string;
  status: 'active' | 'cancelled' | 'completed';
  initiated_at: string;
  resolved_at: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  custom_message: string | null;
}

export function useSOS() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSOSEvent, setCurrentSOSEvent] = useState<SOSEvent | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkForActiveSOSEvent();
    }
  }, [user]);

  const checkForActiveSOSEvent = async () => {
    if (!user) return;
    
    try {
      console.log("Checking for active SOS events for user:", user.id);
      
      const { data, error } = await supabase
        .from('sos_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('initiated_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error checking for active SOS events:", error);
        throw error;
      }
      
      console.log("Active SOS events result:", data);
      
      if (data && data.length > 0) {
        setCurrentSOSEvent(data[0] as SOSEvent);
        console.log("Set current SOS event:", data[0]);
      } else {
        console.log("No active SOS events found");
      }
    } catch (err) {
      console.error("Error checking for active SOS events:", err);
    }
  };

  const triggerSOS = async (location?: { 
    address: string; 
    latitude: number; 
    longitude: number 
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to use the SOS feature.",
        variant: "destructive",
      });
      return { success: false, error: "Authentication required" };
    }

    setIsLoading(true);

    try {
      console.log("Starting SOS trigger process for user:", user.id);
      
      // First check if there's already an active SOS event
      const { data: existingData, error: existingError } = await supabase
        .from('sos_events')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);
        
      if (existingError) {
        console.error("Error checking for existing SOS events:", existingError);
        throw existingError;
      }
      
      // If there's an active event, use that instead of creating a new one
      if (existingData && existingData.length > 0) {
        console.log("Found existing active SOS event:", existingData[0].id);
        const eventId = existingData[0].id;
        
        // Get the full event details
        const { data: fullEventData, error: fullEventError } = await supabase
          .from('sos_events')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (fullEventError) {
          console.error("Error getting full SOS event details:", fullEventError);
          throw fullEventError;
        }
        
        setCurrentSOSEvent(fullEventData as SOSEvent);
        
        toast({
          title: "SOS Already Active",
          description: "Your emergency contacts have already been notified.",
        });
        
        return { success: true, data: fullEventData };
      }
      
      // If no location is provided, use default coordinates for Dehradun, India
      const defaultLocation = {
        address: "Dehradun, India",
        latitude: 30.2724,
        longitude: 78.0010
      };
      
      const locationToUse = location || defaultLocation;
      
      // Create a new SOS event
      console.log("Creating new SOS event with location:", locationToUse);
      const insertData = { 
        user_id: user.id,
        status: 'active',
        initiated_at: new Date().toISOString(),
        location: locationToUse.address || null,
        latitude: locationToUse.latitude || null,
        longitude: locationToUse.longitude || null
      } as Database['public']['Tables']['sos_events']['Insert'];

      const { data, error } = await supabase
        .from('sos_events')
        .insert([insertData])
        .select();

      if (error) {
        console.error("Error creating SOS event:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Failed to create SOS event");
      }

      console.log("SOS event created:", data[0]);
      const sosEvent = data[0] as SOSEvent;
      setCurrentSOSEvent(sosEvent);

      // Get emergency contacts to notify
      const { data: contactsData, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('id, name, phone_number')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError);
        throw contactsError;
      } 
      
      if (!contactsData || contactsData.length === 0) {
        console.warn("No emergency contacts found to notify");
        toast({
          title: "No Emergency Contacts",
          description: "Please add emergency contacts to be notified in case of emergency.",
          variant: "destructive",
        });
      } else {
        console.log(`Found ${contactsData.length} contacts to notify:`, contactsData);
        
        // Create notifications for each contact
        const notifications = contactsData.map(contact => ({
          sos_event_id: sosEvent.id,
          contact_id: contact.id,
          notification_type: 'sms',
          status: 'sent',
          sent_at: new Date().toISOString()
        }));

        const { error: notifyError } = await supabase
          .from('sos_notifications')
          .insert(notifications as any);

        if (notifyError) {
          console.error("Error creating notifications:", notifyError);
        }

        // Send SMS to emergency contacts using the edge function
        try {
          const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'A user';
          const locationInfo = locationToUse.address ? `Last known location: ${locationToUse.address}` : '';
          const message = `${userName} has triggered an SOS alert. ${locationInfo}`;

          const coordinates = {
            lat: locationToUse.latitude,
            lng: locationToUse.longitude
          };

          console.log("Calling send-emergency-sms function with message:", message);
          const { error: smsError, data: smsData } = await supabase.functions.invoke('send-emergency-sms', {
            body: { 
              message, 
              userId: user.id,
              coordinates: coordinates,
              isCheckIn: false
            }
          });

          if (smsError) {
            console.error("Error sending SMS:", smsError);
            throw new Error(`SMS sending failed: ${smsError.message}`);
          } else {
            console.log("SMS notifications sent successfully:", smsData);
          }
        } catch (smsErr: any) {
          console.error("Failed to send SMS notifications:", smsErr);
          
          // Don't throw here - we want to continue even if SMS fails
          toast({
            title: "SMS Sending Issue",
            description: "There was a problem sending SMS notifications, but your SOS is still active.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "SOS Activated",
        description: "Emergency contacts are being notified of your situation.",
      });

      return { success: true, data: sosEvent };
    } catch (err: any) {
      console.error("Error triggering SOS:", err);
      
      toast({
        title: "SOS Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      return { success: false, error: err.message || "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSOS = async (sosId: string) => {
    if (!user) return { success: false, error: "Authentication required" };

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('sos_events')
        .update({ 
          status: 'cancelled',
          resolved_at: new Date().toISOString()
        } as Database['public']['Tables']['sos_events']['Update'])
        .eq('id', sosId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentSOSEvent(null);
      
      toast({
        title: "SOS Cancelled",
        description: "Your emergency alert has been deactivated.",
      });
      
      return { success: true };
    } catch (err: any) {
      console.error("Error cancelling SOS:", err);
      
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const sendCustomMessage = async (sosId: string, message: string) => {
    if (!user) return { success: false, error: "Authentication required" };

    setIsLoading(true);

    try {
      // First update the SOS event with the custom message
      const { error } = await supabase
        .from('sos_events')
        .update({ 
          custom_message: message 
        } as Database['public']['Tables']['sos_events']['Update'])
        .eq('id', sosId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Get SOS event details for coordinates
      const { data: sosData, error: sosError } = await supabase
        .from('sos_events')
        .select('*')
        .eq('id', sosId)
        .single();
        
      if (sosError) throw sosError;
      
      const coordinates = sosData.latitude && sosData.longitude ? {
        lat: sosData.latitude,
        lng: sosData.longitude
      } : null;
      
      // Then send the custom message to emergency contacts
      try {
        const { error: smsError, data: smsData } = await supabase.functions.invoke('send-emergency-sms', {
          body: { 
            message, 
            userId: user.id,
            coordinates: coordinates,
            isCheckIn: false
          }
        });

        if (smsError) {
          console.error("Error sending custom message SMS:", smsError);
          throw new Error(smsError.message);
        }

        console.log("Custom message SMS sent successfully", smsData);
      } catch (smsErr) {
        console.error("Failed to send custom message SMS:", smsErr);
        throw smsErr;
      }
      
      toast({
        title: "Message Sent",
        description: "Your custom message has been sent to your emergency contacts.",
      });
      
      return { success: true };
    } catch (err: any) {
      console.error("Error sending custom message:", err);
      
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendCheckInMessage = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to use the check-in feature.",
        variant: "destructive",
      });
      return { success: false, error: "Authentication required" };
    }

    setIsLoading(true);

    try {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Your contact';
      const message = `${userName} is safe and out of danger now.`;

      const { error: smsError, data: smsData } = await supabase.functions.invoke('send-emergency-sms', {
        body: { 
          message, 
          userId: user.id,
          isCheckIn: true
        }
      });

      if (smsError) {
        console.error("Error sending check-in SMS:", smsError);
        throw new Error(`Check-in SMS sending failed: ${smsError.message}`);
      }

      console.log("Check-in SMS sent successfully", smsData);
      
      toast({
        title: "Check-In Sent",
        description: "Your emergency contacts have been notified that you're safe.",
      });
      
      return { success: true, data: smsData };
    } catch (err: any) {
      console.error("Error sending check-in:", err);
      
      toast({
        title: "Check-In Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      return { success: false, error: err.message || "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    currentSOSEvent,
    triggerSOS,
    cancelSOS,
    sendCustomMessage,
    checkForActiveSOSEvent,
    sendCheckInMessage
  };
}
