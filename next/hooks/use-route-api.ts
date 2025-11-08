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
  route_geometry: [number, number][];
  waypoints: Waypoint[];
  distance_km: number;
  duration_min: number;
  completed_time?: string;
  duration_hours?: number;
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

export interface RouteSession {
  userId: string;
  shape: string;
  status: 'started' | 'completed';
  start_time: string;
  end_time?: string;
  duration_hours?: number;
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
  sessions?: RouteSession[];
  total_checkins: number;
}

/**
 * Hook to fetch route detail for a specific shape
 */
export function useRouteDetail(shape: string | null, userId?: string) {
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
        const url = userId 
          ? `/api/backend/route/${shape}?userId=${userId}`
          : `/api/backend/route/${shape}`;
        const response = await fetch(url);
        
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
  }, [shape, userId]);

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
      const response = await fetch('/api/backend/checkin', {
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
          ? `/api/backend/progress/${userId}?shape=${shape}`
          : `/api/backend/progress/${userId}`;
          
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
        ? `/api/backend/progress/${userId}?shape=${shape}`
        : `/api/backend/progress/${userId}`;
        
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

/**
 * Hook to start a route session
 */
export function useStartRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRoute = async (userId: string, shape: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/backend/route/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, shape }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start route: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Start route error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { startRoute, loading, error };
}

/**
 * Hook to complete a route session
 */
export function useCompleteRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeRoute = async (userId: string, shape: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/backend/route/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, shape }),
      });

      if (!response.ok) {
        throw new Error(`Failed to complete route: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Complete route error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { completeRoute, loading, error };
}

/**
 * Hook to download certificate
 */
export function useDownloadCertificate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadCertificate = async (userId: string, shape: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/backend/certificate/${userId}/${shape}`);

      if (!response.ok) {
        throw new Error(`Failed to download certificate: ${response.statusText}`);
      }

      // 取得圖片 blob
      const blob = await response.blob();
      
      // 創建下載連結
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${shape}_${userId}.png`;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Download certificate error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { downloadCertificate, loading, error };
}

