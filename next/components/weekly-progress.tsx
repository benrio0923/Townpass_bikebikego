"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const USER_ID = "demo-user-123";

interface WeeklyProgressProps {
  onWeekClick?: (letter: string) => void;
}

export function WeeklyProgress({ onWeekClick }: WeeklyProgressProps) {
  const [completedShapes, setCompletedShapes] = useState<Set<string>>(new Set());

  const weeks = [
    { week: "第一週", letter: "T", shapeId: "T" },
    { week: "第二週", letter: "A", shapeId: "A" },
    { week: "第三週", letter: "I", shapeId: "I" },
    { week: "第四週", letter: "P", shapeId: "P" },
    { week: "第五週", letter: "E", shapeId: "E" },
    { week: "第六週", letter: "I", shapeId: "I2" }, // 使用 I2 避免與第三週衝突
  ]

  // 從 localStorage 讀取完成狀態
  useEffect(() => {
    const updateCompletedShapes = () => {
      const completed = new Set<string>();
      weeks.forEach(({ shapeId }) => {
        const completedKey = `route_${USER_ID}_${shapeId}_completed`;
        if (localStorage.getItem(completedKey) === 'true') {
          completed.add(shapeId);
        }
      });
      setCompletedShapes(completed);
    };

    updateCompletedShapes();

    // 監聽 localStorage 變化
    const handleStorageChange = () => {
      updateCompletedShapes();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('routeCompleted', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('routeCompleted', handleStorageChange);
    };
  }, []);

  return (
    <Card className="border-4 border-[#5AB4C5] bg-white p-6">
      <div className="space-y-3">
        {weeks.map((item, index) => {
          const isCompleted = completedShapes.has(item.shapeId);
          
          return (
            <div
              key={index}
              onClick={() => onWeekClick?.(item.shapeId)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg",
                isCompleted && "bg-gradient-to-r from-[#71C5D5] to-[#5AB4C5] text-white",
                !isCompleted && "bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-white"
              )}
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">{item.week}</span>
                {isCompleted && (
                  <Badge className="bg-white/20 text-white">
                    <Check className="w-3 h-3" />
                  </Badge>
                )}
              </div>
              <span className="text-2xl font-black">{item.letter}</span>
            </div>
          );
        })}
      </div>
    </Card>
  )
}
