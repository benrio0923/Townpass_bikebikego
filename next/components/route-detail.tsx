"use client"

import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WaypointCard } from "@/components/waypoint-card";
import { useRouteDetail, useProgress } from "@/hooks/use-route-api";
import { X, MapPin, Clock, TrendingUp, Loader2 } from "lucide-react";

// 動態導入 RouteMap，禁用 SSR
const RouteMap = dynamic(() => import('@/components/route-map').then(mod => ({ default: mod.RouteMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-lg border-2 border-[#B4E2EA] flex items-center justify-center bg-gray-50" style={{ height: '400px' }}>
      <Loader2 className="w-8 h-8 text-[#5AB4C5] animate-spin" />
    </div>
  )
});

interface RouteDetailProps {
  shape: string;
  onClose: () => void;
}

// Get user ID (in production, this should come from authentication)
const USER_ID = "demo-user-123";

export function RouteDetail({ shape, onClose }: RouteDetailProps) {
  const { data: route, loading, error } = useRouteDetail(shape);
  const { data: progress, refresh: refreshProgress } = useProgress(USER_ID, shape);

  const handleCheckInSuccess = () => {
    refreshProgress();
  };

  const getCheckedInWaypoints = (): Set<string> => {
    if (!progress || !progress.checkins) return new Set();
    return new Set(progress.checkins.map(c => c.waypointId));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#5AB4C5] animate-spin mx-auto mb-4" />
          <p className="text-lg text-[#22474E]">載入路線中...</p>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">{error || '路線載入失敗'}</p>
          <Button onClick={onClose} className="bg-[#5AB4C5]">
            返回
          </Button>
        </div>
      </div>
    );
  }

  const checkedInWaypoints = getCheckedInWaypoints();

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-[#5AB4C5] to-[#71C5D5] text-white shadow-lg z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{route.name}</h1>
              <p className="text-sm text-white/90">{route.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Route Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-2 border-[#B4E2EA]">
            <div className="flex flex-col items-center text-center">
              <MapPin className="w-5 h-5 text-[#5AB4C5] mb-2" />
              <p className="text-2xl font-bold text-[#22474E]">
                {route.distance_km.toFixed(1)}
              </p>
              <p className="text-xs text-[#356C77]">總距離 (km)</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-2 border-[#B4E2EA]">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-5 h-5 text-[#5AB4C5] mb-2" />
              <p className="text-2xl font-bold text-[#22474E]">
                {route.duration_min.toFixed(0)}
              </p>
              <p className="text-xs text-[#356C77]">預估時間 (分)</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-2 border-[#B4E2EA]">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-5 h-5 text-[#5AB4C5] mb-2" />
              <p className="text-2xl font-bold text-[#22474E]">
                {(route.similarity * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-[#356C77]">形狀相似度</p>
            </div>
          </Card>
        </div>

        {/* Map */}
        <div>
          <h2 className="text-xl font-bold text-[#22474E] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#5AB4C5]" />
            路線地圖
          </h2>
          <RouteMap 
            routeGeometry={route.route_geometry} 
            waypoints={route.waypoints}
          />
        </div>

        {/* Waypoints List */}
        <div>
          <h2 className="text-xl font-bold text-[#22474E] mb-4">
            景點列表
            <span className="text-sm font-normal text-[#356C77] ml-2">
              ({checkedInWaypoints.size}/{route.waypoints.length} 已完成)
            </span>
          </h2>
          <div className="space-y-3">
            {route.waypoints.map((waypoint, index) => (
              <WaypointCard
                key={waypoint.id}
                waypoint={waypoint}
                index={index + 1}
                shape={shape}
                userId={USER_ID}
                isCheckedIn={checkedInWaypoints.has(waypoint.id)}
                onCheckInSuccess={handleCheckInSuccess}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

