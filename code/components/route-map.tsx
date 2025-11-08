"use client"

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Waypoint } from "@/hooks/use-route-api";

interface RouteMapProps {
  routeGeometry: [number, number][];
  waypoints: Waypoint[];
  className?: string;
}

// Fix Leaflet default icon issue in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

export function RouteMap({ routeGeometry, waypoints, className = '' }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !routeGeometry || routeGeometry.length === 0) {
      return;
    }

    // Destroy existing map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Calculate center of route
    const centerLat = routeGeometry.reduce((sum, coord) => sum + coord[0], 0) / routeGeometry.length;
    const centerLon = routeGeometry.reduce((sum, coord) => sum + coord[1], 0) / routeGeometry.length;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([centerLat, centerLon], 14);
    mapRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Draw route polyline
    if (routeGeometry.length > 0) {
      const routeLine = L.polyline(
        routeGeometry.map(coord => [coord[0], coord[1]] as [number, number]),
        {
          color: '#1e40af',
          weight: 4,
          opacity: 0.7
        }
      ).addTo(map);

      // Fit map to route bounds
      map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    }

    // Add markers for waypoints
    waypoints.forEach((waypoint, index) => {
      const isYouBike = waypoint.type === 'youbike';
      
      // Create custom icon
      const iconHtml = `
        <div style="position: relative;">
          <div style="
            width: 32px;
            height: 32px;
            background: ${isYouBike ? '#71C5D5' : '#93D4DF'};
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            ${index + 1}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([waypoint.lat, waypoint.lon], { icon: customIcon }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #22474E;">
            ${index + 1}. ${waypoint.name}
          </h3>
          <p style="font-size: 12px; color: #356C77; margin-bottom: 4px;">
            ${waypoint.description}
          </p>
          ${
            waypoint.type === 'youbike' && waypoint.available_bikes !== undefined
              ? `<p style="font-size: 12px; color: #5AB4C5;">可借：${waypoint.available_bikes} 輛</p>`
              : ''
          }
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [routeGeometry, waypoints]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`w-full rounded-lg overflow-hidden border-2 border-[#B4E2EA] ${className}`}
      style={{ height: '400px' }}
    />
  );
}

