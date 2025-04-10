import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, Bell, MapPin, Shield, User, Lock, 
  Smartphone, HelpCircle, BookOpen, Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';

const SettingsPage = () => {
  const { toast } = useToast();
  const { profile, isLoading, updateProfile, updateNotificationPreferences } = useUserProfile();
  
  const [settings, setSettings] = useState({
    emergencyNotifications: true,
    locationTracking: true,
    sosGesture: true,
    biometricAuth: false,
    dataBackup: true,
    safetyTips: true,
  });

  useEffect(() => {
    if (profile) {
      setSettings({
        ...settings,
        emergencyNotifications: profile.notification_preferences.sms,
        biometricAuth: profile.biometric_auth_enabled,
      });
    }
  }, [profile]);

  const handleToggle = async (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
    
    try {
      if (setting === 'emergencyNotifications') {
        await updateNotificationPreferences({ sms: !settings.emergencyNotifications });
      } else if (setting === 'biometricAuth') {
        await updateProfile({ biometric_auth_enabled: !settings.biometricAuth });
      } else {
        toast({
          title: 'Setting Updated',
          description: `${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${!settings[setting] ? 'enabled' : 'disabled'}.`,
        });
      }
    } catch (error) {
      setSettings({
        ...settings,
        [setting]: settings[setting]
      });
      
      toast({
        title: 'Update Failed',
        description: 'There was an error saving your settings.',
        variant: 'destructive',
      });
    }
  };

  const saveAllSettings = async () => {
    try {
      await updateNotificationPreferences({
        sms: settings.emergencyNotifications,
        email: true,
        push: true,
      });
      
      await updateProfile({
        biometric_auth_enabled: settings.biometricAuth,
      });
      
      toast({
        title: 'Settings Saved',
        description: 'All your settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save all settings',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
          
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your safety app preferences</p>
        </div>
        
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h2>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Emergency Alerts</h3>
              <p className="text-sm text-muted-foreground">Receive critical emergency notifications</p>
            </div>
            <Switch 
              checked={settings.emergencyNotifications} 
              onCheckedChange={() => handleToggle('emergencyNotifications')}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Services
            </h2>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Background Tracking</h3>
              <p className="text-sm text-muted-foreground">Allow location tracking for safety features</p>
            </div>
            <Switch 
              checked={settings.locationTracking} 
              onCheckedChange={() => handleToggle('locationTracking')}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safety Features
            </h2>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">SOS Gesture</h3>
              <p className="text-sm text-muted-foreground">Enable SOS activation via device gesture</p>
            </div>
            <Switch 
              checked={settings.sosGesture} 
              onCheckedChange={() => handleToggle('sosGesture')}
            />
          </div>
          
          <div className="p-4 border-t flex items-center justify-between">
            <div>
              <h3 className="font-medium">Safety Tips</h3>
              <p className="text-sm text-muted-foreground">Receive periodic safety recommendations</p>
            </div>
            <Switch 
              checked={settings.safetyTips} 
              onCheckedChange={() => handleToggle('safetyTips')}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </h2>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Biometric Authentication</h3>
              <p className="text-sm text-muted-foreground">Use fingerprint or face to unlock the app</p>
            </div>
            <Switch 
              checked={settings.biometricAuth} 
              onCheckedChange={() => handleToggle('biometricAuth')}
            />
          </div>
          
          <div className="p-4 border-t flex items-center justify-between">
            <div>
              <h3 className="font-medium">Data Backup</h3>
              <p className="text-sm text-muted-foreground">Automatically back up your settings and contacts</p>
            </div>
            <Switch 
              checked={settings.dataBackup} 
              onCheckedChange={() => handleToggle('dataBackup')}
            />
          </div>
        </div>
        
        <Button 
          className="w-full mb-2"
          onClick={saveAllSettings}
        >
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
        
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              App Preferences
            </h2>
          </div>
        </div>
        
        <div className="space-y-4 pt-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: "Support",
                description: "The support feature will be available in the next update.",
              });
            }}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Get Help & Support
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: "Privacy Policy",
                description: "The privacy policy will be available in the next update.",
              });
            }}
          >
            <Lock className="h-4 w-4 mr-2" />
            Privacy Policy
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: "App Version",
                description: "Vamika Safety App v1.0.0",
              });
            }}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            App Version
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: "User Guide",
                description: "The user guide will be available in the next update.",
              });
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            User Guide
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
