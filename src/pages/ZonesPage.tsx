import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Shield, Building, Home, Plus, Navigation, Edit, Trash, X, Hospital, School, Coffee, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeZones, SafeZone } from '@/hooks/useSafeZones';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import GoogleMap, { PointOfInterest } from '@/components/GoogleMap';

interface ZoneFormData {
  name: string;
  address: string;
  type: 'home' | 'work' | 'school' | 'other';
  latitude: number;
  longitude: number;
  radius: number;
}

const initialFormData: ZoneFormData = {
  name: '',
  address: '',
  type: 'home',
  latitude: 0,
  longitude: 0,
  radius: 100,
};

const ZoneIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'home':
      return <Home className="h-5 w-5" />;
    case 'work':
      return <Building className="h-5 w-5" />;
    case 'school':
      return <Shield className="h-5 w-5" />;
    default:
      return <MapPin className="h-5 w-5" />;
  }
};

const POIIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'hospital':
      return <Hospital className="h-5 w-5 text-red-500" />;
    case 'police':
      return <Shield className="h-5 w-5 text-blue-500" />;
    case 'school':
    case 'university':
      return <School className="h-5 w-5 text-purple-500" />;
    case 'cafe':
    case 'restaurant':
      return <Coffee className="h-5 w-5 text-amber-700" />;
    case 'gym':
      return <Dumbbell className="h-5 w-5 text-orange-500" />;
    default:
      return <MapPin className="h-5 w-5 text-gray-500" />;
  }
};

const ZonesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { zones, isLoading, addZone, updateZone, deleteZone } = useSafeZones();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ZoneFormData>(initialFormData);
  const [currentZone, setCurrentZone] = useState<SafeZone | null>(null);
  const [mapClickEnabled, setMapClickEnabled] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);
  const [showPOIDialog, setShowPOIDialog] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' || name === 'radius' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value as 'home' | 'work' | 'school' | 'other'
    }));
  };

  const handleAddZone = async () => {
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: 'Name Required',
        description: 'Please provide a name for this safe zone.',
        variant: 'destructive'
      });
      return;
    }
    
    const zoneData = {
      ...formData
    };
    
    await addZone(zoneData);
    setIsAddDialogOpen(false);
    setFormData(initialFormData);
    setMapClickEnabled(false);
  };

  const handleEditZone = async () => {
    if (!currentZone) return;
    
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: 'Name Required',
        description: 'Please provide a name for this safe zone.',
        variant: 'destructive'
      });
      return;
    }
    
    await updateZone(currentZone.id, formData);
    setIsEditDialogOpen(false);
    setCurrentZone(null);
    setFormData(initialFormData);
  };

  const handleDeleteConfirm = async (id: string) => {
    await deleteZone(id);
  };

  const openEditDialog = (zone: SafeZone) => {
    setCurrentZone(zone);
    setFormData({
      name: zone.name,
      address: zone.address,
      type: zone.type,
      latitude: zone.latitude,
      longitude: zone.longitude,
      radius: zone.radius
    });
    setIsEditDialogOpen(true);
  };

  const handleMapClick = (lat: number, lng: number, address: string) => {
    if (!mapClickEnabled) return;
    
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address
    }));
    
    toast({
      title: 'Location Selected',
      description: 'Location has been set for your safe zone.',
    });
  };

  const toggleMapClickMode = () => {
    setMapClickEnabled(!mapClickEnabled);
    
    toast({
      title: mapClickEnabled ? 'Selection Disabled' : 'Selection Enabled',
      description: mapClickEnabled 
        ? 'Map click selection disabled.' 
        : 'Click anywhere on the map to set location for your safe zone.',
    });
  };

  const searchForAddress = () => {
    if (!searchAddress.trim()) {
      toast({
        title: 'Address Required',
        description: 'Please enter an address to search for.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSearching(true);
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        
        setFormData(prev => ({
          ...prev,
          latitude: location.lat(),
          longitude: location.lng(),
          address: results[0].formatted_address
        }));
        
        toast({
          title: 'Address Found',
          description: 'The address has been located on the map.',
        });
      } else {
        toast({
          title: 'Address Not Found',
          description: 'Could not find the specified address. Please try a different one.',
          variant: 'destructive'
        });
      }
      
      setIsSearching(false);
    });
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const geocoder = new window.google.maps.Geocoder();
          try {
            const response = await geocoder.geocode({ location: { lat, lng } });
            const address = response.results[0]?.formatted_address || '';
            
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              address: address
            }));
            
            toast({
              title: 'Current Location Set',
              description: 'Using your current location for the safe zone.',
            });
          } catch (error) {
            console.error("Geocoder failed:", error);
            
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
            }));
            
            toast({
              title: 'Location Set',
              description: 'Using your current coordinates, but could not determine address.',
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: 'Location Error',
            description: 'Could not get your current location. Please check permissions.',
            variant: 'destructive'
          });
        }
      );
    } else {
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by this browser.',
        variant: 'destructive'
      });
    }
  };

  const handleSelectPOI = (poi: PointOfInterest) => {
    setSelectedPOI(poi);
    setShowPOIDialog(true);
  };

  const navigateToPOI = () => {
    if (!selectedPOI) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPOI.location.lat},${selectedPOI.location.lng}&travelmode=driving`;
    
    if (navigator.share) {
      navigator.share({
        title: `Directions to ${selectedPOI.name}`,
        text: `Get directions to ${selectedPOI.name}`,
        url: url
      }).catch(err => {
        window.open(url, '_blank');
      });
    } else {
      window.open(url, '_blank');
    }
    
    setShowPOIDialog(false);
  };

  const addPOIAsZone = () => {
    if (!selectedPOI) return;
    
    setFormData({
      name: selectedPOI.name,
      address: selectedPOI.address || selectedPOI.vicinity || '',
      type: 'other',
      latitude: selectedPOI.location.lat,
      longitude: selectedPOI.location.lng,
      radius: 100
    });
    
    setShowPOIDialog(false);
    setIsAddDialogOpen(true);
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You need to log in to view and manage your safe zones.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Safe Zones</h1>
            <p className="text-muted-foreground">
              Places where you feel secure and nearby points of interest. The app will recognize when you enter or leave your safe zones.
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Zone
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Safe Zone</DialogTitle>
                <DialogDescription>
                  Add a new location where you feel safe. The app will recognize when you enter or leave these zones.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Zone Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder="e.g. Home, Office, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Zone Type</Label>
                  <Select value={formData.type} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work/Office</SelectItem>
                      <SelectItem value="school">School/University</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="radius">
                    Radius (meters)
                  </Label>
                  <Input 
                    id="radius" 
                    name="radius"
                    type="number"
                    min="50"
                    max="1000"
                    value={formData.radius} 
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Safe zone radius in meters (50-1000)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={isSearching}
                      onClick={searchForAddress}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input 
                      id="latitude" 
                      name="latitude"
                      type="number"
                      value={formData.latitude || ''} 
                      onChange={handleInputChange}
                      placeholder="e.g. 40.7128"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input 
                      id="longitude" 
                      name="longitude"
                      type="number"
                      value={formData.longitude || ''} 
                      onChange={handleInputChange}
                      placeholder="e.g. -74.0060"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Set Location</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={useCurrentLocation}
                      className="w-full"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Use My Location
                    </Button>
                    
                    <Button 
                      variant={mapClickEnabled ? "default" : "outline"}
                      onClick={toggleMapClickMode}
                      className="w-full"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {mapClickEnabled ? "Cancel Selection" : "Select on Map"}
                    </Button>
                  </div>
                </div>
                
                <div className="h-60 mt-2 rounded-md overflow-hidden border">
                  <GoogleMap 
                    zones={[]}
                    onAddZone={handleMapClick}
                    height="100%"
                    showControls={false}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setMapClickEnabled(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddZone}>
                  Add Zone
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative h-64 sm:h-96 bg-muted rounded-xl overflow-hidden">
          <GoogleMap 
            zones={zones}
            onSelectZone={openEditDialog}
            onSelectPOI={handleSelectPOI}
            height="100%"
          />
        </div>
        
        <Dialog open={showPOIDialog} onOpenChange={setShowPOIDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <POIIcon type={selectedPOI?.type || 'default'} />
                {selectedPOI?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedPOI?.address || selectedPOI?.vicinity || 'No address available'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-3 py-4">
              <p className="text-sm text-muted-foreground">
                This is a {selectedPOI?.type.replace('_', ' ')} near your location.
              </p>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={navigateToPOI}
                  className="flex-1 flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Navigate
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={addPOIAsZone}
                  className="flex-1 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add as Safe Zone
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Safe Zones</h2>
          
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 rounded-xl border bg-card">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64 mb-3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : zones.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/20">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg mb-1">No safe zones yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first safe zone to get started
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="mx-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Zone
              </Button>
            </div>
          ) : (
            zones.map((zone) => (
              <div key={zone.id} className="p-4 rounded-xl border bg-card">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-lg">
                    <ZoneIcon type={zone.type} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{zone.name}</h3>
                    <p className="text-sm text-muted-foreground">{zone.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Radius: {zone.radius}m
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs"
                        onClick={() => openEditDialog(zone)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs text-destructive"
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Safe Zone</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{zone.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteConfirm(zone.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `Safe Zone: ${zone.name}`,
                              text: `Check out this safe zone: ${zone.name} at ${zone.address}`,
                              url: `https://maps.google.com/maps?q=${zone.latitude},${zone.longitude}`
                            }).catch(err => {
                              window.open(`https://maps.google.com/maps?q=${zone.latitude},${zone.longitude}`, '_blank');
                            });
                          } else {
                            window.open(`https://maps.google.com/maps?q=${zone.latitude},${zone.longitude}`, '_blank');
                          }
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Safe Zone</DialogTitle>
            <DialogDescription>
              Update the details for this safe zone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Zone Name</Label>
              <Input 
                id="edit-name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-type">Zone Type</Label>
              <Select value={formData.type} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work/Office</SelectItem>
                  <SelectItem value="school">School/University</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="flex gap-2">
                <Input 
                  id="edit-address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isSearching}
                  onClick={searchForAddress}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input 
                  id="edit-latitude" 
                  name="latitude"
                  type="number"
                  value={formData.latitude} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input 
                  id="edit-longitude" 
                  name="longitude"
                  type="number"
                  value={formData.longitude} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-radius">
                Radius (meters)
              </Label>
              <Input 
                id="edit-radius" 
                name="radius"
                type="number"
                min="50"
                max="1000"
                value={formData.radius} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Update Location</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={useCurrentLocation}
                  className="w-full"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Use My Location
                </Button>
                
                <Button 
                  variant={mapClickEnabled ? "default" : "outline"}
                  onClick={toggleMapClickMode}
                  className="w-full"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {mapClickEnabled ? "Cancel Selection" : "Select on Map"}
                </Button>
              </div>
            </div>
            
            <div className="h-60 mt-2 rounded-md overflow-hidden border">
              <GoogleMap 
                zones={currentZone ? [currentZone] : []}
                onAddZone={handleMapClick}
                height="100%"
                showControls={false}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setMapClickEnabled(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditZone}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ZonesPage;
