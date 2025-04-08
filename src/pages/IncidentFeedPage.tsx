
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Shield, AlertTriangle, Clock, Flag, Filter, MapIcon, ListFilter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIncidents } from '@/hooks/useIncidents';
import { format } from 'date-fns';
import { Incident } from '@/hooks/useIncidents';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import GoogleMap from '@/components/GoogleMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IncidentFeedPage = () => {
  const { incidents, isLoading, error } = useIncidents();
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { toast } = useToast();
  
  const getTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Recently';
    
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    
    return `${Math.floor(seconds)} seconds ago`;
  };
  
  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'harassment':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'stalking':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'unsafe_area':
        return <Shield className="h-4 w-4 text-primary" />;
      default:
        return <Flag className="h-4 w-4 text-orange-500" />;
    }
  };
  
  const getIncidentTitle = (type: string) => {
    switch (type) {
      case 'harassment':
        return "Harassment";
      case 'stalking':
        return "Stalking";
      case 'unsafe_area':
        return "Unsafe Area";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };
  
  const filteredIncidents = filter === 'all' ? 
    incidents : 
    incidents.filter(incident => incident.incident_type === filter);

  const mapFormattedIncidents = filteredIncidents
    .filter(incident => incident.latitude && incident.longitude)
    .map(incident => ({
      id: incident.id,
      name: getIncidentTitle(incident.incident_type),
      address: incident.location || 'Unknown location',
      type: incident.incident_type as any,
      latitude: incident.latitude!,
      longitude: incident.longitude!,
      radius: 50 // Default radius for visualization
    }));
  
  const viewIncidentDetails = (incident: Incident) => {
    // In a real app, this would navigate to a details page
    toast({
      title: getIncidentTitle(incident.incident_type),
      description: incident.description || 'No description provided',
    });
  };
  
  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">Error loading incidents</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Community Alerts</h1>
            <p className="text-muted-foreground">Recent safety incidents reported nearby</p>
          </div>
          
          <div className="flex gap-2">
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === 'list' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <ListFilter className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button 
                variant={viewMode === 'map' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-none"
              >
                <MapIcon className="h-4 w-4 mr-1" />
                Map
              </Button>
            </div>
            
            <Link to="/report-incident">
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Report
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button 
            variant={filter === 'all' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'harassment' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('harassment')}
          >
            Harassment
          </Button>
          <Button 
            variant={filter === 'stalking' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('stalking')}
          >
            Stalking
          </Button>
          <Button 
            variant={filter === 'unsafe_area' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('unsafe_area')}
          >
            Unsafe Areas
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">Loading incidents...</p>
          </div>
        ) : (
          <>
            {viewMode === 'map' ? (
              <div className="h-[calc(100vh-280px)] min-h-[400px] rounded-lg overflow-hidden border bg-muted">
                {mapFormattedIncidents.length > 0 ? (
                  <GoogleMap 
                    zones={mapFormattedIncidents}
                    onSelectZone={(zone) => {
                      const incident = filteredIncidents.find(i => i.id === zone.id);
                      if (incident) {
                        viewIncidentDetails(incident);
                      }
                    }}
                    height="100%"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="font-medium">No incidents with location data</p>
                      <p className="text-sm text-muted-foreground">Select a different filter or view as list</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map(incident => (
                  <Card key={incident.id} className="bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-primary/10">
                            {getIncidentIcon(incident.incident_type)}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {getIncidentTitle(incident.incident_type)}
                            </h3>
                            <div className="flex items-center text-xs text-muted-foreground gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{getTimeAgo(incident.reported_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {incident.is_verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                        )}
                      </div>
                      
                      <p className="text-sm mb-3">{incident.description}</p>
                      
                      {incident.location && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{incident.location}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {filteredIncidents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No incidents reported in this category</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default IncidentFeedPage;
