
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/schema';
import { Json } from '@/integrations/supabase/schema';

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  biometric_auth_enabled: boolean;
  notification_preferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        // Convert the database type to our UserProfile type
        // Handle notification_preferences specially
        const typedProfile: UserProfile = {
          id: data.id,
          full_name: data.full_name || '',
          phone_number: data.phone_number,
          avatar_url: data.avatar_url,
          biometric_auth_enabled: data.biometric_auth_enabled || false,
          notification_preferences: parseNotificationPreferences(data.notification_preferences),
        };

        setProfile(typedProfile);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
        toast({
          title: 'Error fetching profile',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  // Helper function to parse notification preferences from Json type
  const parseNotificationPreferences = (prefs: Json | null): UserProfile['notification_preferences'] => {
    const defaultPrefs = {
      sms: true,
      email: true,
      push: true
    };

    if (!prefs) return defaultPrefs;

    // Type guard for object
    if (typeof prefs !== 'object' || prefs === null || Array.isArray(prefs)) {
      return defaultPrefs;
    }

    // Type assertion with explicit property checks
    const prefObj = prefs as Record<string, unknown>;
    
    return {
      sms: typeof prefObj.sms === 'boolean' ? prefObj.sms : defaultPrefs.sms,
      email: typeof prefObj.email === 'boolean' ? prefObj.email : defaultPrefs.email,
      push: typeof prefObj.push === 'boolean' ? prefObj.push : defaultPrefs.push
    };
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id'>>) => {
    if (!user) return { success: false, error: 'You must be logged in' };
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates as Database['public']['Tables']['profiles']['Update'])
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Convert the returned data to our UserProfile type
      const updatedProfile: UserProfile = {
        id: data.id,
        full_name: data.full_name || '',
        phone_number: data.phone_number,
        avatar_url: data.avatar_url,
        biometric_auth_enabled: data.biometric_auth_enabled || false,
        notification_preferences: parseNotificationPreferences(data.notification_preferences),
      };
      
      setProfile(updatedProfile);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      return { success: true, data: updatedProfile };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      
      toast({
        title: 'Error updating profile',
        description: err.message,
        variant: 'destructive',
      });
      
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationPreferences = async (preferences: Partial<UserProfile['notification_preferences']>) => {
    if (!profile) return { success: false, error: 'Profile not loaded' };
    
    const updatedPreferences = {
      ...profile.notification_preferences,
      ...preferences
    };
    
    return updateProfile({ notification_preferences: updatedPreferences });
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    updateNotificationPreferences
  };
}
