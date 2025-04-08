
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User, Camera, Save, Shield, Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { profile, isLoading, updateProfile, updateNotificationPreferences } = useUserProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    biometric_auth_enabled: false,
    notifications: {
      sms: true,
      email: true,
      push: true
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: user?.email || '',
        phone_number: profile.phone_number || '',
        biometric_auth_enabled: profile.biometric_auth_enabled || false,
        notifications: profile.notification_preferences || {
          sms: true,
          email: true,
          push: true
        }
      });
    }
  }, [profile, user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggle = (field: string) => {
    if (field === 'biometric_auth_enabled') {
      setFormData(prev => ({ 
        ...prev, 
        biometric_auth_enabled: !prev.biometric_auth_enabled 
      }));
    } else if (field.startsWith('notifications.')) {
      const notificationType = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationType]: !prev.notifications[notificationType as keyof typeof prev.notifications]
        }
      }));
    }
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update profile information
      await updateProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        biometric_auth_enabled: formData.biometric_auth_enabled,
      });
      
      // Update notification preferences separately
      await updateNotificationPreferences(formData.notifications);
      
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You need to log in to view and manage your profile.
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Log In
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and settings</p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              onClick={() => {
                toast({
                  description: "Profile photo upload will be available in the next update.",
                });
              }}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-4 space-y-4">
              <Skeleton className="h-4 w-40 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-4 space-y-4">
              <Skeleton className="h-4 w-40 mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48 mt-1" />
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48 mt-1" />
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-card rounded-lg border p-4 space-y-4">
              <h2 className="font-medium text-md">Personal Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted/40"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input 
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-4 space-y-4">
              <h2 className="font-medium text-md">Privacy & Security</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications.sms" className="cursor-pointer">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive safety alerts via text messages</p>
                </div>
                <Switch 
                  id="notifications.sms"
                  checked={formData.notifications.sms}
                  onCheckedChange={() => handleToggle('notifications.sms')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications.email" className="cursor-pointer">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch 
                  id="notifications.email"
                  checked={formData.notifications.email}
                  onCheckedChange={() => handleToggle('notifications.email')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications.push" className="cursor-pointer">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch 
                  id="notifications.push"
                  checked={formData.notifications.push}
                  onCheckedChange={() => handleToggle('notifications.push')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="biometric_auth_enabled" className="cursor-pointer">Biometric Authentication</Label>
                  <p className="text-xs text-muted-foreground">Use fingerprint or face ID to login</p>
                </div>
                <Switch 
                  id="biometric_auth_enabled"
                  checked={formData.biometric_auth_enabled}
                  onCheckedChange={() => handleToggle('biometric_auth_enabled')}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full flex items-center gap-2" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            
            <div className="border-t pt-4">
              <Button 
                variant="outline" 
                className="w-full text-destructive"
                onClick={() => {
                  logout();
                }}
              >
                Log Out
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
