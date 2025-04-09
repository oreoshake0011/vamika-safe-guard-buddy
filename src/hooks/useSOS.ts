
import { useState } from 'react';
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
      // Create a new SOS event
      const insertData = { 
        user_id: user.id,
        status: 'active',
        initiated_at: new Date().toISOString(),
        location: location?.address,
        latitude: location?.latitude,
        longitude: location?.longitude
      } as Database['public']['Tables']['sos_events']['Insert'];

      const { data, error } = await supabase
        .from('sos_events')
        .insert([insertData])
        .select();

      if (error) throw error;

      const sosEvent = data[0] as SOSEvent;
      setCurrentSOSEvent(sosEvent);

      // Get emergency contacts to notify
      const { data: contactsData, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('id, name, phone_number')
        .order('priority', { ascending: true });

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError);
      } else if (contactsData && contactsData.length > 0) {
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
          const defaultMessage = `EMERGENCY ALERT: ${userName} has triggered an SOS alert`;
          const locationInfo = location ? `Last known location: ${location.address}` : '';
          const message = `${defaultMessage}. ${locationInfo}`;

          const { error: smsError } = await supabase.functions.invoke('send-emergency-sms', {
            body: { message, userId: user.id }
          });

          if (smsError) {
            console.error("Error sending SMS:", smsError);
          }
        } catch (smsErr) {
          console.error("Failed to send SMS notifications:", smsErr);
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
        description: err.message,
        variant: "destructive",
      });
      
      return { success: false, error: err.message };
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
      const { error } = await supabase
        .from('sos_events')
        .update({ 
          custom_message: message 
        } as Database['public']['Tables']['sos_events']['Update'])
        .eq('id', sosId)
        .eq('user_id', user.id);

      if (error) throw error;
      
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

  return {
    isLoading,
    currentSOSEvent,
    triggerSOS,
    cancelSOS,
    sendCustomMessage
  };
}
