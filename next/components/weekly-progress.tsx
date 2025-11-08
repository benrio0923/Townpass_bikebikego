"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeeklyProgressProps {
  onWeekClick?: (letter: string) => void;
}

export function WeeklyProgress({ onWeekClick }: WeeklyProgressProps) {
  const weeks = [
    { week: "第一週", letter: "T", status: "completed" },
    { week: "第二週", letter: "A", status: "current" },
    { week: "第三週", letter: "I", status: "locked" },
    { week: "第四週", letter: "P", status: "locked" },
    { week: "第五週", letter: "E", status: "locked" },
    { week: "第六週", letter: "I", status: "locked" },
  ]

  return (
    <Card className="border-4 border-[#5AB4C5] bg-white p-6">
      <div className="space-y-3">
        {weeks.map((item, index) => (
          <div
            key={index}
            onClick={() => onWeekClick?.(item.letter)}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg",
              item.status === "completed" && "bg-gradient-to-r from-[#71C5D5] to-[#5AB4C5] text-white",
              item.status === "current" && "bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] text-white",
              item.status === "locked" && "bg-[#E5E7EB] text-[#6B7280]",
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold">{item.week}</span>
              {item.status === "completed" && (
                <Badge className="bg-white/20 text-white">
                  <Check className="w-3 h-3" />
                </Badge>
              )}
            </div>
            <span className="text-2xl font-black">{item.letter}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
