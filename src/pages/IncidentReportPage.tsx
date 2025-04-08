
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Camera, AlertCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '@/hooks/useIncidents';
import { useAuth } from '@/contexts/AuthContext';

type IncidentType = 'harassment' | 'stalking' | 'unsafe_area' | 'other';

const IncidentReportPage = () => {
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [incidentType, setIncidentType] = useState<IncidentType>('harassment');
  const [hasMedia, setHasMedia] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { reportIncident } = useIncidents();
  const { user } = useAuth();
  
  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to report an incident.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    
    const incidentData = {
      incident_type: incidentType,
      description,
      location,
      is_public: true,
      happened_at: new Date().toISOString(),
      severity: 'medium',
      status: 'reported',
      user_id: user.id,
      latitude: null,
      longitude: null,
      is_verified: false,
      reported_at: new Date().toISOString(),
    };
    
    const { success, error } = await reportIncident(incidentData);
    
    setIsSubmitting(false);
    
    if (success) {
      // Wait a moment before navigating to show the success toast
      setTimeout(() => {
        navigate('/incident-feed');
      }, 1500);
    }
  };
  
  const getCurrentLocation = () => {
    // Simulate getting location
    toast({
      description: "Fetching your location...",
    });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, this would look up the address using reverse geocoding
          setLocation('Current Location');
          toast({
            description: "Location updated",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Available",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddMedia = () => {
    setHasMedia(true);
    toast({
      description: "Media upload simulation: Photo added",
    });
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Report an Incident</h1>
          <p className="text-muted-foreground">Your report helps others stay safe and informed</p>
        </div>
        
        <form onSubmit={handleSubmitIncident} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="incident-type">Incident Type</Label>
            <select 
              id="incident-type"
              className="w-full rounded-md border border-input bg-background p-2"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as IncidentType)}
            >
              <option value="harassment">Harassment</option>
              <option value="stalking">Stalking</option>
              <option value="unsafe_area">Unsafe Area</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input 
                id="location"
                placeholder="Incident location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={getCurrentLocation}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what happened..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Evidence (Optional)</Label>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                className="flex items-center gap-2 w-full"
                onClick={handleAddMedia}
              >
                <Camera className="h-4 w-4" />
                <span>{hasMedia ? "Media Added" : "Add Photo/Video"}</span>
              </Button>
            </div>
            {hasMedia && (
              <p className="text-xs text-muted-foreground">1 photo added</p>
            )}
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={!description || !location || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            All reports are anonymous. Abusive reports may result in account suspension.
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default IncidentReportPage;
