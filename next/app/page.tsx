"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Route } from "lucide-react"
import { WeeklyProgress } from "@/components/weekly-progress"
import { RouteDetail } from "@/components/route-detail"

export default function Home() {
  const [selectedShape, setSelectedShape] = useState<string | null>(null)

  const handleWeekClick = (letter: string) => {
    setSelectedShape(letter)
  }

  const handleCloseRoute = () => {
    setSelectedShape(null)
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
                <h1 className="text-2xl font-bold">台北奇跡</h1>
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
              <p className="text-3xl font-bold text-[#22474E] mb-1">10</p>
              <p className="text-sm text-[#356C77]">已探索景點</p>
            </div>
          </Card>
          <Card className="p-6 bg-white border-2 border-[#B4E2EA] hover:border-[#5AB4C5] transition-all hover:shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-[#93D4DF] to-[#5AB4C5] rounded-full p-4 mb-3">
                <Route className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-[#22474E] mb-1">3</p>
              <p className="text-sm text-[#356C77]">完成路線</p>
            </div>
          </Card>
        </div>

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
