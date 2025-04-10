import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, Bell, MapPin, Shield, User, Lock, 
  Smartphone, HelpCircle, BookOpen, Save, Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
    taskerIntegration: false,
  });
  
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      setSettings({
        ...settings,
        emergencyNotifications: profile.notification_preferences.sms,
        biometricAuth: profile.biometric_auth_enabled,
        taskerIntegration: !!profile.tasker_api_key,
      });
      
      if (profile.tasker_api_key) {
        setApiKey(profile.tasker_api_key);
      }
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
      } else if (setting === 'taskerIntegration') {
        if (!settings.taskerIntegration) {
          handleGenerateApiKey();
        } else {
          await updateProfile({ tasker_api_key: null });
          setApiKey('');
        }
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

  const handleGenerateApiKey = async () => {
    try {
      setIsGeneratingKey(true);
      
      const randomBytes = new Uint8Array(32);
      window.crypto.getRandomValues(randomBytes);
      const newApiKey = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 32);
      
      await updateProfile({ tasker_api_key: newApiKey });
      
      setApiKey(newApiKey);
      setIsApiKeyDialogOpen(true);
      
      toast({
        title: 'API Key Generated',
        description: 'Your Tasker API key has been generated successfully.',
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate API key',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyApiKeyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
          
          <div className="p-4 border-t flex items-center justify-between">
            <div>
              <h3 className="font-medium">Tasker Integration</h3>
              <p className="text-sm text-muted-foreground">Enable automation with Tasker app</p>
            </div>
            <Switch 
              checked={settings.taskerIntegration} 
              onCheckedChange={() => handleToggle('taskerIntegration')}
            />
          </div>
          
          {settings.taskerIntegration && (
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsApiKeyDialogOpen(true)}
                disabled={isGeneratingKey}
              >
                <Key className="h-4 w-4 mr-2" />
                {apiKey ? 'View API Key' : 'Generate API Key'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This API key is used to authenticate Tasker when sending emergency SMS
              </p>
            </div>
          )}
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
      
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tasker API Key</DialogTitle>
            <DialogDescription>
              Use this API key to authenticate Tasker when sending emergency SMS.
              Keep this key secret and secure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                value={apiKey}
                readOnly
                className="font-mono text-sm"
              />
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="px-3"
              onClick={copyApiKeyToClipboard}
            >
              <span className="sr-only">Copy</span>
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">How to use with Tasker:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Install Tasker from Google Play Store</li>
              <li>Create a new Task in Tasker</li>
              <li>Add an HTTP Request action</li>
              <li>Set Method to POST</li>
              <li>URL: https://[YOUR-PROJECT-ID].supabase.co/functions/v1/tasker-emergency-sms</li>
              <li>Content Type: application/json</li>
              <li>Body: {"{"}"message":"EMERGENCY! Help needed","apiKey":"{apiKey}","userId":"{profile?.id}"{"}"}  </li>
              <li>Create a Profile to trigger this Task (e.g. button press, shake gesture)</li>
            </ol>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setIsApiKeyDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SettingsPage;
