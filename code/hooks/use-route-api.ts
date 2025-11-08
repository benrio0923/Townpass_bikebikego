import { useState, useEffect } from 'react';

export interface Waypoint {
  id: string;
  name: string;
  description: string;
  type: 'youbike' | 'attraction';
  lat: number;
  lon: number;
  available_bikes?: number;
  nearby_attractions?: string[];
}

export interface RouteDetail {
  shape: string;
  name: string;
  description: string;
  similarity: number;
  route_geometry: [number, number][];
  waypoints: Waypoint[];
  distance_km: number;
  duration_min: number;
}

export interface CheckInRequest {
  userId: string;
  waypointId: string;
  shape: string;
  userLat: number;
  userLon: number;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  distance: number;
  verified: boolean;
  timestamp: string;
}

export interface UserProgress {
  userId: string;
  progress: Array<{
    shape: string;
    checkins: string[];
    total_waypoints: number;
    completed_waypoints: number;
    completion_rate: number;
  }>;
  checkins: Array<{
    waypointId: string;
    shape: string;
    timestamp: string;
    verified: boolean;
  }>;
  total_checkins: number;
}

/**
 * Hook to fetch route detail for a specific shape
 */
export function useRouteDetail(shape: string | null) {
  const [data, setData] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shape) {
      setData(null);
      return;
    }

    const fetchRoute = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/backend/v1/route/${shape}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch route: ${response.statusText}`);
        }
        
        const routeData = await response.json();
        setData(routeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching route:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [shape]);

  return { data, loading, error };
}

/**
 * Hook for check-in functionality
 */
export function useCheckIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIn = async (request: CheckInRequest): Promise<CheckInResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/backend/v1/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Check-in failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Check-in error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { checkIn, loading, error };
}

/**
 * Hook to fetch user progress
 */
export function useProgress(userId: string, shape?: string) {
  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = shape 
          ? `/api/backend/v1/progress/${userId}?shape=${shape}`
          : `/api/backend/v1/progress/${userId}`;
          
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch progress: ${response.statusText}`);
        }

        const progressData = await response.json();
        setData(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId, shape]);

  const refresh = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const url = shape 
        ? `/api/backend/v1/progress/${userId}?shape=${shape}`
        : `/api/backend/v1/progress/${userId}`;
        
      const response = await fetch(url);
      if (response.ok) {
        const progressData = await response.json();
        setData(progressData);
      }
    } catch (err) {
      console.error('Error refreshing progress:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

