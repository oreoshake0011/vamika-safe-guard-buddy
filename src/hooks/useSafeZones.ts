
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/schema';

export interface SafeZone {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'work' | 'school' | 'other';
  latitude: number;
  longitude: number;
  radius: number;
}

export function useSafeZones() {
  const [zones, setZones] = useState<SafeZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setZones([]);
      setIsLoading(false);
      return;
    }

    const fetchSafeZones = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('safe_zones')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform data to match SafeZone type by ensuring type is within our enum
        const typedZones = (data || []).map(zone => ({
          ...zone,
          type: isValidZoneType(zone.type) ? zone.type : 'other'
        })) as SafeZone[];

        setZones(typedZones);
      } catch (err: any) {
        console.error('Error fetching safe zones:', err);
        setError(err.message);
        toast({
          title: 'Error fetching safe zones',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafeZones();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:safe_zones')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'safe_zones', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          fetchSafeZones(); // Refresh zones when there's a change
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Helper function to validate zone type
  const isValidZoneType = (type: string): type is 'home' | 'work' | 'school' | 'other' => {
    return ['home', 'work', 'school', 'other'].includes(type);
  };

  const addZone = async (zone: Omit<SafeZone, 'id'>) => {
    if (!user) return { success: false, error: 'You must be logged in' };

    try {
      const insertData = { 
        ...zone, 
        user_id: user.id 
      } as Database['public']['Tables']['safe_zones']['Insert'];
      
      const { data, error } = await supabase
        .from('safe_zones')
        .insert([insertData])
        .select();

      if (error) throw error;

      // Ensure the returned zone has a valid type
      const newZone = {
        ...data[0],
        type: isValidZoneType(data[0].type) ? data[0].type : 'other'
      } as SafeZone;

      setZones(prev => [newZone, ...prev]);
      
      toast({
        title: 'Zone added',
        description: `${zone.name} has been added to your safe zones.`,
      });
      
      return { success: true, data: newZone };
    } catch (err: any) {
      console.error('Error adding safe zone:', err);
      
      toast({
        title: 'Error adding zone',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  const updateZone = async (id: string, updates: Partial<Omit<SafeZone, 'id'>>) => {
    if (!user) return { success: false, error: 'You must be logged in' };

    try {
      const { data, error } = await supabase
        .from('safe_zones')
        .update(updates as Database['public']['Tables']['safe_zones']['Update'])
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;

      // Ensure the returned zone has a valid type
      const updatedZone = {
        ...data[0],
        type: isValidZoneType(data[0].type) ? data[0].type : 'other'
      } as SafeZone;

      setZones(prev => prev.map(zone => (zone.id === id ? { ...zone, ...updatedZone } : zone)));
      
      toast({
        title: 'Zone updated',
        description: `Safe zone has been updated successfully.`,
      });
      
      return { success: true, data: updatedZone };
    } catch (err: any) {
      console.error('Error updating safe zone:', err);
      
      toast({
        title: 'Error updating zone',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  const deleteZone = async (id: string) => {
    if (!user) return { success: false, error: 'You must be logged in' };

    try {
      const { error } = await supabase
        .from('safe_zones')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setZones(prev => prev.filter(zone => zone.id !== id));
      
      toast({
        title: 'Zone deleted',
        description: `Safe zone has been removed.`,
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting safe zone:', err);
      
      toast({
        title: 'Error deleting zone',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  return {
    zones,
    isLoading,
    error,
    addZone,
    updateZone,
    deleteZone,
  };
}
