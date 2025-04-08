import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Building, Home, MapPin, Shield, Navigation, Hospital, School, Coffee, Dumbbell, X } from 'lucide-react';
import { SafeZone } from '@/hooks/useSafeZones';
import { useToast } from '@/hooks/use-toast';

const mapStyles = {
  default: [],
  dark: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
  ]
};

export interface PointOfInterest {
  placeId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  type: string;
  icon?: string;
  vicinity?: string;
}

interface GoogleMapProps {
  zones: SafeZone[];
  onAddZone?: (lat: number, lng: number, address: string) => void;
  onSelectZone?: (zone: SafeZone) => void;
  height?: string;
  showControls?: boolean;
  onSelectPOI?: (poi: PointOfInterest) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  zones, 
  onAddZone, 
  onSelectZone,
  height = '400px',
  showControls = true,
  onSelectPOI
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [circles, setCircles] = useState<google.maps.Circle[]>([]);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [poiMarkers, setPoiMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [navigationActive, setNavigationActive] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<google.maps.LatLng | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (mapRef.current && !map) {
        const defaultLocation = { lat: 37.7749, lng: -122.4194 };
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 15,
          styles: mapStyles.default,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#4285F4",
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        });
        setDirectionsRenderer(directionsRendererInstance);
        
        setMap(mapInstance);
        setIsMapReady(true);
        
        getUserLocation();
        
        if (onAddZone) {
          mapInstance.addListener('click', async (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            
            const geocoder = new window.google.maps.Geocoder();
            const latLng = e.latLng;
            
            try {
              const response = await geocoder.geocode({ location: latLng });
              const address = response.results[0]?.formatted_address || '';
              
              onAddZone(latLng.lat(), latLng.lng(), address);
            } catch (error) {
              console.error("Geocoder failed:", error);
              toast({
                title: 'Geocoding Error',
                description: 'Could not determine address. Please try again.',
                variant: 'destructive'
              });
            }
          });
        }
      }
    }
  }, []);

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = new window.google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setUserLocation(userPos);
          
          if (map) {
            map.setCenter(userPos);
            map.setZoom(15);
            
            searchNearbyPlaces(userPos);
          }
          
          toast({
            title: 'Location Found',
            description: 'Using your current location',
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast({
            title: 'Location Error',
            description: `Could not get your location: ${error.message}`,
            variant: 'destructive'
          });
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast({
        title: 'Location Not Supported',
        description: 'Geolocation is not supported by this browser.',
        variant: 'destructive'
      });
    }
  }, [map, toast]);

  useEffect(() => {
    if (!map || !userLocation) return;
    
    if (userMarker) {
      userMarker.setMap(null);
    }
    
    const marker = new window.google.maps.Marker({
      position: userLocation,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
      title: 'Your Location',
      zIndex: 1000
    });
    
    setUserMarker(marker);
  }, [map, userLocation]);

  const searchNearbyPlaces = useCallback((location: google.maps.LatLng) => {
    if (!map || !window.google || !window.google.maps) return;

    poiMarkers.forEach(marker => marker.setMap(null));
    setPoiMarkers([]);

    const radius = 3000;
    const placesService = new window.google.maps.places.PlacesService(map);
    
    const placeTypes = [
      'hospital', 
      'police', 
      'school', 
      'university',
      'cafe',
      'gym', 
      'shopping_mall',
      'pharmacy',
      'restaurant'
    ];
    
    const newMarkers: google.maps.Marker[] = [];
    
    const createMarker = (place: google.maps.places.PlaceResult) => {
      if (!place.geometry || !place.geometry.location) return;
      
      const icon = getPlaceIcon(place.types?.[0] || 'default');
      
      const marker = new window.google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: icon.color,
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 1,
        }
      });
      
      marker.addListener('click', () => {
        if (onSelectPOI) {
          const poi: PointOfInterest = {
            placeId: place.place_id || '',
            name: place.name || 'Unknown Place',
            location: {
              lat: place.geometry?.location.lat() || 0,
              lng: place.geometry?.location.lng() || 0
            },
            address: place.vicinity || '',
            type: place.types?.[0] || 'default'
          };
          onSelectPOI(poi);
        } else {
          setSelectedDestination(place.geometry?.location || null);
          showInfoWindow(marker, place);
        }
      });
      
      newMarkers.push(marker);
    };
    
    placeTypes.forEach(type => {
      const request = {
        location,
        radius,
        type
      };
      
      placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach(place => createMarker(place));
          setPoiMarkers(prev => [...prev, ...newMarkers]);
        }
      });
    });
  }, [map, poiMarkers, onSelectPOI]);

  const showInfoWindow = (marker: google.maps.Marker, place: google.maps.places.PlaceResult) => {
    if (!map) return;
    
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="max-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">${place.name}</h3>
          <p style="font-size: 12px; margin-bottom: 8px;">${place.vicinity || ''}</p>
          <button id="navigate-btn" style="background: #4285F4; color: white; border: none; padding: 6px 10px; cursor: pointer; border-radius: 4px; font-size: 12px;">
            Get Directions
          </button>
        </div>
      `
    });
    
    infoWindow.open(map, marker);
    
    window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
      document.getElementById('navigate-btn')?.addEventListener('click', () => {
        if (place.geometry?.location && userLocation) {
          calculateRoute(userLocation, place.geometry.location);
        }
        infoWindow.close();
      });
    });
  };

  const calculateRoute = (origin: google.maps.LatLng, destination: google.maps.LatLng) => {
    if (!map || !directionsRenderer) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          setNavigationActive(true);
          
          const route = result?.routes[0];
          if (route) {
            const distance = route.legs[0].distance?.text || '';
            const duration = route.legs[0].duration?.text || '';
            
            toast({
              title: 'Route Calculated',
              description: `Distance: ${distance}, Duration: ${duration}`,
            });
          }
        } else {
          toast({
            title: 'Routing Error',
            description: 'Could not calculate a route to this destination.',
            variant: 'destructive'
          });
        }
      }
    );
  };

  const cancelNavigation = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({
        routes: [],
        geocoded_waypoints: [],
        request: { travelMode: window.google.maps.TravelMode.DRIVING }
      } as google.maps.DirectionsResult);
      
      setNavigationActive(false);
      setSelectedDestination(null);
      
      toast({
        title: 'Navigation Cancelled',
        description: 'Route has been cleared.',
      });
    }
  };

  useEffect(() => {
    if (!map || !isMapReady) return;
    
    markers.forEach(marker => marker.setMap(null));
    circles.forEach(circle => circle.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    const newCircles: google.maps.Circle[] = [];
    
    zones.forEach(zone => {
      const position = new window.google.maps.LatLng(zone.latitude, zone.longitude);
      
      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: zone.name,
        icon: getMarkerIcon(zone.type),
      });
      
      if (onSelectZone) {
        marker.addListener('click', () => {
          onSelectZone(zone);
        });
      }
      
      const circle = new window.google.maps.Circle({
        map: map,
        center: position,
        radius: zone.radius,
        fillColor: getCircleColor(zone.type),
        fillOpacity: 0.2,
        strokeColor: getCircleColor(zone.type),
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });
      
      if (onSelectZone) {
        circle.addListener('click', () => {
          onSelectZone(zone);
        });
      }
      
      newMarkers.push(marker);
      newCircles.push(circle);
    });
    
    setMarkers(newMarkers);
    setCircles(newCircles);
    
    if (zones.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      zones.forEach(zone => {
        bounds.extend(new window.google.maps.LatLng(zone.latitude, zone.longitude));
      });
      
      if (userLocation) {
        bounds.extend(userLocation);
      }
      
      map.fitBounds(bounds);
      
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) {
          map.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, zones, isMapReady, userLocation]);

  const getMarkerIcon = (type: string): google.maps.Symbol | string => {
    const iconColor = getIconColor(type);
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: iconColor,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8
    };
  };

  const getIconColor = (type: string): string => {
    switch (type) {
      case 'home':
        return '#4CAF50';
      case 'work':
        return '#2196F3';
      case 'school':
        return '#9C27B0';
      default:
        return '#FF9800';
    }
  };

  const getCircleColor = (type: string): string => {
    return getIconColor(type);
  };

  const getPlaceIcon = (placeType: string) => {
    switch (placeType) {
      case 'hospital':
        return { color: '#F44336', icon: 'hospital' };
      case 'police':
        return { color: '#3F51B5', icon: 'police' };
      case 'school':
      case 'university':
        return { color: '#9C27B0', icon: 'school' };
      case 'cafe':
      case 'restaurant':
        return { color: '#795548', icon: 'cafe' };
      case 'gym':
        return { color: '#FF9800', icon: 'dumbbell' };
      case 'shopping_mall':
        return { color: '#E91E63', icon: 'shopping-bag' };
      case 'pharmacy':
        return { color: '#4CAF50', icon: 'plus-circle' };
      default:
        return { color: '#607D8B', icon: 'map-pin' };
    }
  };

  const handleMyLocation = () => {
    getUserLocation();
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mapRef} className="absolute inset-0 rounded-xl" />
      
      {showControls && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          {navigationActive && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center gap-2 shadow-lg"
              onClick={cancelNavigation}
            >
              <X className="h-4 w-4" />
              Cancel Navigation
            </Button>
          )}
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex items-center gap-2 shadow-lg"
            onClick={handleMyLocation}
          >
            <Navigation className="h-4 w-4" />
            My Location
          </Button>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
