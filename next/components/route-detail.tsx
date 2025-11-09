"use client"

import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WaypointCard } from "@/components/waypoint-card";
import { useRouteDetail, useProgress, useStartRoute, useCompleteRoute } from "@/hooks/use-route-api";
import { X, MapPin, Clock, Play, Loader2, Timer } from "lucide-react";
import { useEffect, useState } from "react";

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
  // I2 需要轉換為 I 來調用後端 API（後端只認識 I）
  const actualShape = shape === 'I2' ? 'I' : shape;
  const displayName = shape === 'I2' ? 'I 字形（第六週）' : `${shape} 字形`;
  
  const { data: route, loading, error } = useRouteDetail(actualShape, USER_ID);
  const { data: progress, refresh: refreshProgress } = useProgress(USER_ID, actualShape);
  const { startRoute, loading: startLoading } = useStartRoute();
  const { completeRoute } = useCompleteRoute();
  
  // 前端狀態管理（使用 localStorage）
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [completedTime, setCompletedTime] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState<number | null>(null);
  const [checkedInWaypoints, setCheckedInWaypoints] = useState<Set<string>>(new Set());

  // localStorage 鍵名
  const getStorageKey = (key: string) => `route_${USER_ID}_${shape}_${key}`;

  // 從 localStorage 載入打卡記錄
  const loadCheckedInWaypoints = (): Set<string> => {
    const saved = localStorage.getItem(getStorageKey('checkins'));
    if (saved) {
      try {
        const checkinArray = JSON.parse(saved) as string[];
        return new Set(checkinArray);
      } catch (e) {
        return new Set<string>();
      }
    }
    return new Set<string>();
  };

  // 保存打卡記錄到 localStorage
  const saveCheckedInWaypoint = (waypointId: string) => {
    const current = loadCheckedInWaypoints();
    current.add(waypointId);
    localStorage.setItem(getStorageKey('checkins'), JSON.stringify([...current]));
    setCheckedInWaypoints(current);
  };

  // 從 localStorage 載入狀態
  useEffect(() => {
    const savedStarted = localStorage.getItem(getStorageKey('started'));
    const savedCompleted = localStorage.getItem(getStorageKey('completed'));
    const savedStartTime = localStorage.getItem(getStorageKey('startTime'));
    const savedCompletedTime = localStorage.getItem(getStorageKey('completedTime'));
    const savedDuration = localStorage.getItem(getStorageKey('duration'));

    // 載入打卡記錄
    const loadedCheckins = loadCheckedInWaypoints();
    setCheckedInWaypoints(loadedCheckins);

    if (savedCompleted === 'true') {
      setIsCompleted(true);
      setIsStarted(false);
      setCompletedTime(savedCompletedTime);
      setDurationHours(savedDuration ? parseFloat(savedDuration) : null);
    } else if (savedStarted === 'true' && savedStartTime) {
      setIsStarted(true);
      setStartTime(new Date(savedStartTime));
    }
  }, [shape]);

  const handleCheckInSuccess = (waypointId: string) => {
    // 保存打卡到 localStorage
    saveCheckedInWaypoint(waypointId);
    
    // 同步到後端（可選）
    refreshProgress();
    
    // 檢查是否全部完成
    setTimeout(() => checkIfAllCompleted(), 100);
  };

  const checkIfAllCompleted = async () => {
    if (!route || !isStarted || isCompleted) return;
    
    const currentCheckins = loadCheckedInWaypoints();
    const allCompleted = route.waypoints.every(w => currentCheckins.has(w.id));
    
    if (allCompleted && startTime) {
      // 計算耗時
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();
      const hours = durationMs / (1000 * 60 * 60);
      
      // 保存到 localStorage
      localStorage.setItem(getStorageKey('completed'), 'true');
      localStorage.setItem(getStorageKey('started'), 'false');
      localStorage.setItem(getStorageKey('completedTime'), endTime.toISOString());
      localStorage.setItem(getStorageKey('duration'), hours.toString());
      
      // 更新狀態
      setIsCompleted(true);
      setIsStarted(false);
      setCompletedTime(endTime.toISOString());
      setDurationHours(hours);
      
      // 觸發自定義事件，通知首頁更新
      window.dispatchEvent(new Event('routeCompleted'));
      
      // 同步到後端（可選）
      try {
        await completeRoute(USER_ID, shape);
      } catch (e) {
        console.log('後端同步失敗（不影響前端）:', e);
      }
    }
  };

  const handleStartRoute = async () => {
    const now = new Date();
    
    // 保存到 localStorage
    localStorage.setItem(getStorageKey('started'), 'true');
    localStorage.setItem(getStorageKey('startTime'), now.toISOString());
    localStorage.removeItem(getStorageKey('completed'));
    localStorage.removeItem(getStorageKey('completedTime'));
    localStorage.removeItem(getStorageKey('duration'));
    localStorage.removeItem(getStorageKey('checkins')); // 清除打卡記錄
    
    // 更新狀態
    setIsStarted(true);
    setStartTime(now);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setCheckedInWaypoints(new Set()); // 清除打卡狀態
    
    // 同步到後端（可選）
    try {
      await startRoute(USER_ID, shape);
    } catch (e) {
      console.log('後端同步失敗（不影響前端）:', e);
    }
  };


  // 檢查是否已完成
  useEffect(() => {
    checkIfAllCompleted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, route]);

  // 實時更新計時器
  useEffect(() => {
    if (!isStarted || isCompleted || !startTime) return;

    // 立即更新一次
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    setElapsedSeconds(elapsed);

    // 每秒更新
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, isCompleted, startTime]);

  // 格式化時間顯示
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Completion Info or Start Button */}
        {isCompleted && completedTime && durationHours ? (
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-green-800">🎉 路線已完成！</p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-sm text-green-600">耗時</p>
                  <p className="text-xl font-bold text-green-800">{durationHours.toFixed(1)} 小時</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">完成時間</p>
                  <p className="text-sm font-semibold text-green-800">
                    {new Date(completedTime).toLocaleString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-3">
                返回首頁完成所有路線後可下載完成證書
              </p>
            </div>
          </Card>
        ) : isStarted ? (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-300">
            <div className="text-center space-y-3">
              <p className="text-lg font-bold text-blue-800">⏱️ 路線進行中</p>
              
              {/* 計時器顯示 */}
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">已用時間</span>
                </div>
                <div className="text-4xl font-bold text-blue-800 tabular-nums">
                  {formatElapsedTime(elapsedSeconds)}
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  {elapsedSeconds >= 3600 
                    ? `${(elapsedSeconds / 3600).toFixed(1)} 小時` 
                    : `${Math.floor(elapsedSeconds / 60)} 分鐘`}
                </div>
              </div>
              
              <p className="text-sm text-blue-600">完成所有打卡後將自動計時結束</p>
            </div>
          </Card>
        ) : (
          <Button
            onClick={handleStartRoute}
            disabled={startLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 py-6 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            {startLoading ? '開始中...' : '開始路線'}
          </Button>
        )}

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
            {route.waypoints.map((waypoint, index) => {
              // Check if previous waypoint is checked in
              const isPreviousCheckedIn = index === 0 || checkedInWaypoints.has(route.waypoints[index - 1].id);
              
              return (
                <WaypointCard
                  key={waypoint.id}
                  waypoint={waypoint}
                  index={index + 1}
                  shape={shape}
                  userId={USER_ID}
                  isCheckedIn={checkedInWaypoints.has(waypoint.id)}
                  isCompleted={isCompleted}
                  isPreviousCheckedIn={isPreviousCheckedIn}
                  onCheckInSuccess={handleCheckInSuccess}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

