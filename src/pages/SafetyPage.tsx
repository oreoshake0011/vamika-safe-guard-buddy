
import React from 'react';
import Layout from '@/components/Layout';
import SafetyCard from '@/components/SafetyCard';
import EmergencyButton from '@/components/EmergencyButton';
import { 
  Bell, Phone, Wifi, MapPin, Clock, ShieldAlert, 
  Volume2, Camera, Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSOS } from '@/hooks/useSOS';

const SafetyPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { triggerSOS } = useSOS();

  const handleEmergency = async () => {
    try {
      const result = await triggerSOS();
      if (result.success) {
        navigate('/sos');
      } else {
        toast({
          title: "SOS Error",
          description: result.error || "Failed to activate SOS",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error triggering SOS:", error);
      toast({
        title: "SOS Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const showFeatureToast = (feature: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `The ${feature} feature will be available in the next update.`,
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Safety Tools</h1>
          <p className="text-muted-foreground">Access all safety features from one place</p>
        </div>
        
        <div className="text-center mb-6">
          <EmergencyButton 
            onActivate={handleEmergency}
            size="lg"
            className="mx-auto mb-4"
          />
          <p className="text-sm text-muted-foreground">Press and hold to activate emergency mode</p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <SafetyCard
            title="Safety Check"
            description="Let your contacts know you're safe with scheduled check-ins."
            icon={<Bell className="h-5 w-5" />}
            action={{
              label: "Set Up Check-In",
              onClick: () => showFeatureToast("Safety Check")
            }}
          />
          
          <SafetyCard
            title="Fake Call"
            description="Trigger a fake incoming call to help you escape uncomfortable situations."
            icon={<Phone className="h-5 w-5" />}
            action={{
              label: "Set Up Fake Call",
              onClick: () => showFeatureToast("Fake Call")
            }}
          />
          
          <SafetyCard
            title="Hidden Camera Detector"
            description="Scan for potential hidden cameras in your surroundings."
            icon={<Camera className="h-5 w-5" />}
            action={{
              label: "Start Scanner",
              onClick: () => showFeatureToast("Camera Detector")
            }}
          />
          
          <SafetyCard
            title="WiFi Safety Check"
            description="Check if your Wi-Fi network is secure and trustworthy."
            icon={<Wifi className="h-5 w-5" />}
            action={{
              label: "Check WiFi",
              onClick: () => showFeatureToast("WiFi Check")
            }}
          />
          
          <SafetyCard
            title="Safe Route"
            description="Get directions through well-lit and safer routes to your destination."
            icon={<MapPin className="h-5 w-5" />}
            action={{
              label: "Plan Safe Route",
              onClick: () => showFeatureToast("Safe Route")
            }}
          />
          
          <SafetyCard
            title="Safety Timer"
            description="Set a timer for activities and get alerts if you don't check in."
            icon={<Clock className="h-5 w-5" />}
            action={{
              label: "Set Timer",
              onClick: () => showFeatureToast("Safety Timer")
            }}
          />
          
          <SafetyCard
            title="Emergency Alarm"
            description="Loud alarm to draw attention in case of emergency."
            icon={<Volume2 className="h-5 w-5" />}
            action={{
              label: "Activate Alarm",
              onClick: () => showFeatureToast("Emergency Alarm")
            }}
          />
          
          <SafetyCard
            title="Share Location"
            description="Temporarily share your live location with friends or family."
            icon={<Share2 className="h-5 w-5" />}
            action={{
              label: "Share Location",
              onClick: () => showFeatureToast("Location Sharing")
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SafetyPage;
