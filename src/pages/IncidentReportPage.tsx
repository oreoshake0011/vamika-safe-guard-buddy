
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const incidentSchema = z.object({
  incidentType: z.string().min(1, "Incident type is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

const IncidentReportPage = () => {
  const [hasMedia, setHasMedia] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { reportIncident } = useIncidents();
  const { user } = useAuth();
  
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incidentType: 'harassment',
      location: '',
      description: '',
    },
  });
  
  const handleSubmitIncident = async (values: IncidentFormValues) => {
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
      incident_type: values.incidentType,
      description: values.description,
      location: values.location,
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
    
    console.log("Submitting incident data:", incidentData);
    
    try {
      const { success, error, data } = await reportIncident(incidentData);
      
      if (success) {
        toast({
          title: "Incident Reported",
          description: "Thank you for reporting this incident. It will help keep our community safe.",
        });
        
        // Wait a moment before navigating to show the success toast
        setTimeout(() => {
          navigate('/feed');
        }, 1500);
      } else {
        toast({
          title: "Error Reporting Incident",
          description: error || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        console.error("Error reporting incident:", error);
      }
    } catch (err) {
      console.error("Exception during incident report:", err);
      toast({
        title: "System Error",
        description: "A system error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getCurrentLocation = () => {
    toast({
      description: "Fetching your location...",
    });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue('location', 'Current Location');
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitIncident)} className="space-y-6">
            <FormField
              control={form.control}
              name="incidentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Type</FormLabel>
                  <select 
                    className="w-full rounded-md border border-input bg-background p-2"
                    {...field}
                  >
                    <option value="harassment">Harassment</option>
                    <option value="stalking">Stalking</option>
                    <option value="unsafe_area">Unsafe Area</option>
                    <option value="other">Other</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="Incident location"
                        {...field}
                        className="flex-1"
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={getCurrentLocation}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what happened..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              All reports are anonymous. Abusive reports may result in account suspension.
            </p>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default IncidentReportPage;
