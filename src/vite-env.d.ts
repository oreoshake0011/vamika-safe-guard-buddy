
/// <reference types="vite/client" />
/// <reference types="@types/google.maps" />

// Ensure google maps is available globally
interface Window {
  google: typeof google;
}

// Add global namespace for Google Places API
declare namespace google.maps.places {
  class PlacesService {
    constructor(attrContainer: HTMLDivElement | google.maps.Map);
    nearbySearch(
      request: {
        location: google.maps.LatLng | google.maps.LatLngLiteral;
        radius?: number;
        type?: string;
        keyword?: string;
        rankBy?: number;
      },
      callback: (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus,
        pagination?: google.maps.places.PlaceSearchPagination | null
      ) => void
    ): void;
  }

  interface PlaceResult {
    place_id?: string;
    name?: string;
    formatted_address?: string;
    vicinity?: string;
    geometry?: {
      location: google.maps.LatLng;
      viewport?: google.maps.LatLngBounds;
    };
    types?: string[];
    rating?: number;
    icon?: string;
  }

  enum PlacesServiceStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    NOT_FOUND = 'NOT_FOUND'
  }

  interface PlaceSearchPagination {
    nextPage(): void;
    hasNextPage: boolean;
  }
}
