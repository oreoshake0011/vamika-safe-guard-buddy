
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, Bell, MapPin, Shield, User, Lock, 
  Moon, Smartphone, HelpCircle, BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emergencyNotifications: true,
    locationTracking: true,
    sosGesture: true,
    biometricAuth: false,
    darkMode: false,
    dataBackup: true,
    safetyTips: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
    
    toast({
      title: 'Setting Updated',
      description: `${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${!settings[setting] ? 'enabled' : 'disabled'}.`,
    });
  };

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
        
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              App Preferences
            </h2>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch 
              checked={settings.darkMode} 
              onCheckedChange={() => handleToggle('darkMode')}
            />
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
