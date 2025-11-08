"use client"

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, CheckCircle2, Bike } from "lucide-react";
import { Waypoint, CheckInRequest, useCheckIn } from "@/hooks/use-route-api";
import { getCurrentLocation } from "@/lib/geolocation";

interface WaypointCardProps {
  waypoint: Waypoint;
  index: number;
  shape: string;
  userId: string;
  isCheckedIn?: boolean;
  isCompleted?: boolean;
  onCheckInSuccess?: (waypointId: string) => void;
}

export function WaypointCard({
  waypoint,
  index,
  shape,
  userId,
  isCheckedIn = false,
  isCompleted = false,
  onCheckInSuccess
}: WaypointCardProps) {
  const { checkIn, loading } = useCheckIn();
  const [checkedIn, setCheckedIn] = useState(isCheckedIn);
  const [checkInMessage, setCheckInMessage] = useState<string>('');
  
  // 如果路線已完成，強制顯示為已打卡
  const displayAsChecked = isCompleted || checkedIn;

  const handleNavigate = () => {
    // Open Google Maps with directions to this waypoint
    const url = `https://www.google.com/maps/dir/?api=1&destination=${waypoint.lat},${waypoint.lon}`;
    window.open(url, '_blank');
  };

  const handleCheckIn = async () => {
    setCheckInMessage('正在獲取您的位置...');
    
    try {
      // Get current location with better error handling
      const locationResult = await getCurrentLocation();
      
      if (!locationResult.success || !locationResult.location) {
        let errorMessage = '無法獲取您的位置';
        
        if (locationResult.error?.includes('denied')) {
          errorMessage = '請在瀏覽器設定中允許位置存取權限';
        } else if (locationResult.error?.includes('unavailable')) {
          errorMessage = '位置服務暫時無法使用，請稍後再試';
        } else if (locationResult.error?.includes('timeout')) {
          errorMessage = '位置獲取超時，請確認 GPS 已開啟';
        } else if (locationResult.error) {
          errorMessage = `位置獲取失敗：${locationResult.error}`;
        }
        
        setCheckInMessage(errorMessage);
        return;
      }

      setCheckInMessage('驗證位置中...');

      const request: CheckInRequest = {
        userId,
        waypointId: waypoint.id,
        shape,
        userLat: locationResult.location.lat,
        userLon: locationResult.location.lon
      };

      const result = await checkIn(request);

      if (result) {
        if (result.success && result.verified) {
          setCheckedIn(true);
          setCheckInMessage(`✓ 打卡成功！距離景點 ${result.distance.toFixed(0)} 公尺`);
          onCheckInSuccess?.(waypoint.id);
        } else {
          const distanceMsg = result.distance > 0 ? `（距離 ${result.distance.toFixed(0)} 公尺）` : '';
          setCheckInMessage(`${result.message || '打卡失敗'} ${distanceMsg}`);
        }
      }
    } catch (error) {
      setCheckInMessage('打卡時發生錯誤，請稍後再試');
      console.error('Check-in error:', error);
    }
  };

  return (
    <Card className={`p-4 border-2 transition-colors ${
      isCompleted 
        ? 'bg-gray-100 border-gray-300' 
        : 'bg-white border-[#B4E2EA] hover:border-[#5AB4C5]'
    }`}>
      <div className="flex items-start gap-4">
        {/* Index Badge */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            isCompleted
              ? 'bg-gray-400'
              : 'bg-gradient-to-br from-[#5AB4C5] to-[#71C5D5]'
          }`}>
            {index}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-1 ${
                isCompleted ? 'text-gray-600' : 'text-[#22474E]'
              }`}>
                {waypoint.name}
              </h3>
              <p className={`text-sm ${
                isCompleted ? 'text-gray-500' : 'text-[#356C77]'
              }`}>
                {waypoint.description}
              </p>
            </div>
            
            {/* Type Badge */}
            {waypoint.type === 'youbike' ? (
              <Badge className="bg-[#71C5D5] text-white flex items-center gap-1">
                <Bike className="w-3 h-3" />
                YouBike
              </Badge>
            ) : (
              <Badge className="bg-[#93D4DF] text-white flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                景點
              </Badge>
            )}
          </div>

          {/* YouBike Info */}
          {waypoint.type === 'youbike' && waypoint.available_bikes !== undefined && (
            <div className={`text-xs mb-2 ${
              isCompleted ? 'text-gray-500' : 'text-[#5AB4C5]'
            }`}>
              可借：{waypoint.available_bikes} 輛
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className={`flex items-center gap-1 ${
                isCompleted
                  ? 'text-gray-500 border-gray-400 cursor-not-allowed'
                  : 'text-[#5AB4C5] border-[#5AB4C5] hover:bg-[#EDF8FA]'
              }`}
              onClick={handleNavigate}
              disabled={isCompleted}
            >
              <Navigation className="w-4 h-4" />
              導航
            </Button>

            {displayAsChecked ? (
              <Button
                size="sm"
                className={`flex items-center gap-1 cursor-default ${
                  isCompleted
                    ? 'bg-gray-400 text-white'
                    : 'bg-[#71C5D5] text-white'
                }`}
                disabled
              >
                <CheckCircle2 className="w-4 h-4" />
                已打卡
              </Button>
            ) : (
              <Button
                size="sm"
                className="flex items-center gap-1 bg-gradient-to-r from-[#5AB4C5] to-[#71C5D5] text-white hover:opacity-90"
                onClick={handleCheckIn}
                disabled={loading}
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? '打卡中...' : '打卡'}
              </Button>
            )}
          </div>

          {/* Check-in Message */}
          {checkInMessage && !isCompleted && (
            <div className={`text-xs mt-2 p-2 rounded ${
              checkedIn 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : checkInMessage.includes('正在') || checkInMessage.includes('驗證')
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {checkInMessage}
            </div>
          )}
          
          {/* Completed Route Message */}
          {isCompleted && (
            <div className="text-xs mt-2 p-2 rounded bg-gray-100 text-gray-600 border border-gray-300">
              ✓ 路線已完成
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

