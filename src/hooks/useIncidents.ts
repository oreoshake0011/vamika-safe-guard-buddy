
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Incident {
  id: string;
  incident_type: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  reported_at: string | null;
  happened_at: string | null;
  is_verified: boolean | null;
  is_public: boolean | null;
  severity: string | null;
  status: string | null;
  user_id: string | null;
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('is_public', true)
        .order('reported_at', { ascending: false });

      if (error) throw error;

      setIncidents(data || []);
    } catch (err: any) {
      console.error('Error fetching incidents:', err);
      setError(err.message);
      toast({
        title: 'Error fetching incidents',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    
    // Set up real-time subscription for new incidents
    const channel = supabase
      .channel('public:incidents')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'incidents' }, 
        (payload) => {
          fetchIncidents(); // Refresh the incidents when there's a change
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const reportIncident = async (incidentData: Omit<Incident, 'id'>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to report an incident.',
        variant: 'destructive',
      });
      return { success: false, error: 'Authentication required' };
    }
    
    setIsLoading(true);
    
    try {
      // Ensure user_id is set
      const completeIncidentData = {
        ...incidentData,
        user_id: user.id,
        reported_at: new Date().toISOString(),
        is_public: incidentData.is_public !== undefined ? incidentData.is_public : true
      };
      
      const { data, error } = await supabase
        .from('incidents')
        .insert([completeIncidentData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Incident Reported',
        description: 'Thank you for helping keep the community safe.',
      });
      
      // Update local state with the new incident
      setIncidents(prevIncidents => [data, ...prevIncidents]);
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error reporting incident:', err);
      
      toast({
        title: 'Error Reporting Incident',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to update an incident.',
        variant: 'destructive',
      });
      return { success: false, error: 'Authentication required' };
    }
    
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)  // Ensure users can only update their own incidents
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Incident Updated',
        description: 'The incident has been updated successfully.',
      });
      
      // Update local state
      setIncidents(prevIncidents => 
        prevIncidents.map(incident => 
          incident.id === id ? { ...incident, ...data } : incident
        )
      );
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating incident:', err);
      
      toast({
        title: 'Error Updating Incident',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  const deleteIncident = async (id: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to delete an incident.',
        variant: 'destructive',
      });
      return { success: false, error: 'Authentication required' };
    }
    
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);  // Ensure users can only delete their own incidents
      
      if (error) throw error;
      
      toast({
        title: 'Incident Deleted',
        description: 'The incident has been removed successfully.',
      });
      
      // Update local state
      setIncidents(prevIncidents => 
        prevIncidents.filter(incident => incident.id !== id)
      );
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting incident:', err);
      
      toast({
        title: 'Error Deleting Incident',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  return {
    incidents,
    isLoading,
    error,
    reportIncident,
    updateIncident,
    deleteIncident,
    refreshIncidents: fetchIncidents
  };
}
