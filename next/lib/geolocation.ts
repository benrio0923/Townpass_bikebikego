/**
 * Geolocation utilities
 */

export interface Location {
  lat: number;
  lon: number;
}

export interface GeolocationResult {
  success: boolean;
  location?: Location;
  error?: string;
}

/**
 * Get current user location using browser geolocation API
 */
export async function getCurrentLocation(): Promise<GeolocationResult> {
  if (!('geolocation' in navigator)) {
    return {
      success: false,
      error: 'Geolocation is not supported by your browser'
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          location: {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
        });
      },
      (error) => {
        resolve({
          success: false,
          error: error.message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in meters
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if user is within specified distance of a location
 */
export async function isWithinDistance(
  targetLat: number,
  targetLon: number,
  maxDistance: number = 100
): Promise<{ within: boolean; distance?: number; error?: string }> {
  const result = await getCurrentLocation();
  
  if (!result.success || !result.location) {
    return {
      within: false,
      error: result.error
    };
  }
  
  const distance = calculateDistance(
    result.location.lat,
    result.location.lon,
    targetLat,
    targetLon
  );
  
  return {
    within: distance <= maxDistance,
    distance: Math.round(distance)
  };
}

