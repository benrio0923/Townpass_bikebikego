"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Route, Award, Download } from "lucide-react"
import { WeeklyProgress } from "@/components/weekly-progress"
import { RouteDetail } from "@/components/route-detail"

const USER_ID = "demo-user-123";
const ALL_SHAPES = ['T', 'A', 'I', 'P', 'E', 'I2']; // I2 為第六週的 I 字形

export default function Home() {
  const [selectedShape, setSelectedShape] = useState<string | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [allCompleted, setAllCompleted] = useState(false)
  const [totalWaypoints, setTotalWaypoints] = useState(0)

  // 初始化：T 字形預設為完成，並清除 I2（第六週）狀態用於 Demo
  useEffect(() => {
    const tKey = `route_${USER_ID}_T_completed`;
    if (!localStorage.getItem(tKey)) {
      // 預設 T 字形為完成
      localStorage.setItem(tKey, 'true');
      localStorage.setItem(`route_${USER_ID}_T_completedTime`, new Date().toISOString());
      localStorage.setItem(`route_${USER_ID}_T_duration`, '3.0');
    }
    
    // 🔧 Demo 用：自動清除第六週（I2）的完成狀態
    // Demo 完成後請將 resetI2 改為 false 或刪除此段代碼
    const resetI2 = true; // 啟用自動清除
    if (resetI2) {
      ['started', 'startTime', 'completed', 'completedTime', 'duration', 'checkins'].forEach(key => {
        localStorage.removeItem(`route_${USER_ID}_I2_${key}`);
      });
      console.log('✅ 已自動清除第六週（I2）狀態');
    }
  }, []);

  // 計算完成路線數量和景點總數
  useEffect(() => {
    const calculateCompleted = () => {
      let routeCount = 0;
      let waypointCount = 0;
      
      ALL_SHAPES.forEach(shape => {
        const completedKey = `route_${USER_ID}_${shape}_completed`;
        const checkinsKey = `route_${USER_ID}_${shape}_checkins`;
        
        if (localStorage.getItem(completedKey) === 'true') {
          routeCount++;
          
          // 計算該路線的景點數
          const checkinsData = localStorage.getItem(checkinsKey);
          if (checkinsData) {
            try {
              const checkins = JSON.parse(checkinsData);
              waypointCount += checkins.length;
            } catch (e) {
              console.error('解析打卡數據失敗:', e);
            }
          }
        }
      });
      
      setCompletedCount(routeCount);
      setTotalWaypoints(waypointCount);
      setAllCompleted(routeCount === ALL_SHAPES.length);
    };

    calculateCompleted();

    // 監聽 localStorage 變化
    const handleStorageChange = () => {
      calculateCompleted();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 也監聽自定義事件（用於同一頁面內的更新）
    window.addEventListener('routeCompleted', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('routeCompleted', handleStorageChange);
    };
  }, [selectedShape]); // 當從詳情頁返回時重新計算

  const handleWeekClick = (letter: string) => {
    setSelectedShape(letter)
  }

  const handleCloseRoute = () => {
    setSelectedShape(null)
  }

  const handleDownloadCertificate = () => {
    // 直接下載證書模板圖片
    const link = document.createElement('a');
    link.href = '/Certificate template.png';
    link.download = `taipei_cycling_certificate_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (selectedShape) {
    return <RouteDetail shape={selectedShape} onClose={handleCloseRoute} />
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDF8FA] to-[#FFFFFF]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5AB4C5] to-[#71C5D5] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">台北騎跡</h1>
                <p className="text-sm text-white/90">Taipei Miracle</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white text-[#5AB4C5] font-semibold">
              服務
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats - 簡化為 2 欄 */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-white border-2 border-[#B4E2EA] hover:border-[#5AB4C5] transition-all hover:shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-[#5AB4C5] to-[#71C5D5] rounded-full p-4 mb-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-[#22474E] mb-1">{totalWaypoints}</p>
              <p className="text-sm text-[#356C77]">已探索景點</p>
            </div>
          </Card>
          <Card className="p-6 bg-white border-2 border-[#B4E2EA] hover:border-[#5AB4C5] transition-all hover:shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-[#93D4DF] to-[#5AB4C5] rounded-full p-4 mb-3">
                <Route className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-[#22474E] mb-1">{completedCount}</p>
              <p className="text-sm text-[#356C77]">完成路線</p>
            </div>
          </Card>
        </div>

        {/* Certificate Download Button - 只有全部完成時顯示 */}
        {allCompleted && (
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">🎉 恭喜完成所有挑戰！</h3>
                  <p className="text-sm text-amber-700 mt-1">您已完成所有台北騎跡路線</p>
                </div>
              </div>
              <Button
                onClick={handleDownloadCertificate}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 px-6 py-6 text-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                下載完成證書
              </Button>
            </div>
          </Card>
        )}

        {/* Weekly Progress - 核心功能區 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#22474E] flex items-center gap-2 mb-2">
              <Calendar className="w-6 h-6 text-[#5AB4C5]" />
              每週計劃
            </h2>
            <p className="text-sm text-[#356C77]">選擇字母開始您的台北探索之旅</p>
          </div>
          <WeeklyProgress onWeekClick={handleWeekClick} />
        </section>
      </main>
    </div>
  )
}
