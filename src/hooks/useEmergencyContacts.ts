
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/schema';

export interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  relationship?: string;
  priority: number;
}

export function useEmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setContacts([]);
      setIsLoading(false);
      return;
    }

    const fetchContacts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .select('*')
          .order('priority', { ascending: true });

        if (error) {
          throw error;
        }

        setContacts(data || []);
      } catch (err: any) {
        console.error('Error fetching emergency contacts:', err);
        setError(err.message);
        toast({
          title: 'Error fetching contacts',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [user, toast]);

  const addContact = async (contact: Omit<EmergencyContact, 'id'>) => {
    if (!user) return { success: false, error: 'You must be logged in' };

    try {
      const insertData = {
        ...contact,
        user_id: user.id
      } as Database['public']['Tables']['emergency_contacts']['Insert'];

      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([insertData])
        .select();

      if (error) throw error;

      setContacts(prev => [...prev, data[0] as EmergencyContact]);
      
      toast({
        title: 'Contact added',
        description: `${contact.name} has been added to your emergency contacts.`,
      });
      
      return { success: true, data: data[0] };
    } catch (err: any) {
      console.error('Error adding contact:', err);
      
      toast({
        title: 'Error adding contact',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  const updateContact = async (id: string, updates: Partial<Omit<EmergencyContact, 'id'>>) => {
    if (!user) return { success: false, error: 'You must be logged in' };

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(updates as Database['public']['Tables']['emergency_contacts']['Update'])
        .eq('id', id)
        .select();

      if (error) throw error;

      setContacts(prev => 
        prev.map(contact => (contact.id === id ? { ...contact, ...updates } : contact))
      );
      
      toast({
        title: 'Contact updated',
        description: `Emergency contact has been updated successfully.`,
      });
      
      return { success: true, data: data[0] };
    } catch (err: any) {
      console.error('Error updating contact:', err);
      
      toast({
        title: 'Error updating contact',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) return { success: false, error: 'You must be logged in' };

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      toast({
        title: 'Contact deleted',
        description: `Emergency contact has been removed.`,
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      
      toast({
        title: 'Error deleting contact',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  const reorderContact = async (id: string, newPriority: number) => {
    if (!user) return { success: false, error: 'You must be logged in' };

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update({ priority: newPriority } as Database['public']['Tables']['emergency_contacts']['Update'])
        .eq('id', id)
        .select();

      if (error) throw error;

      // Re-fetch contacts to ensure correct order
      const { data: updatedContacts, error: fetchError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('priority', { ascending: true });

      if (fetchError) throw fetchError;

      setContacts(updatedContacts || []);
      
      return { success: true };
    } catch (err: any) {
      console.error('Error reordering contact:', err);
      
      toast({
        title: 'Error updating priority',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    }
  };

  return {
    contacts,
    isLoading,
    error,
    addContact,
    updateContact,
    deleteContact,
    reorderContact
  };
}
