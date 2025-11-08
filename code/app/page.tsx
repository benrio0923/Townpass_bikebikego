"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Route, TrendingUp, ChevronRight, Star } from "lucide-react"
import { ExploreCard } from "@/components/explore-card"
import { RouteCard } from "@/components/route-card"
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
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-2 border-[#B4E2EA] hover:border-[#5AB4C5] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-[#5AB4C5] to-[#71C5D5] rounded-full p-3 mb-2">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#22474E]">10</p>
              <p className="text-xs text-[#356C77]">已探索景點</p>
            </div>
          </Card>
          <Card className="p-4 bg-white border-2 border-[#B4E2EA] hover:border-[#5AB4C5] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-[#93D4DF] to-[#5AB4C5] rounded-full p-3 mb-2">
                <Route className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#22474E]">3</p>
              <p className="text-xs text-[#356C77]">完成路線</p>
            </div>
          </Card>
          <Card className="p-4 bg-white border-2 border-[#B4E2EA] hover:border-[#5AB4C5] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-[#71C5D5] to-[#468D9B] rounded-full p-3 mb-2">
                <Star className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#22474E]">85</p>
              <p className="text-xs text-[#356C77]">探索積分</p>
            </div>
          </Card>
        </div>

        {/* Current Route */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#22474E] flex items-center gap-2">
              <Route className="w-5 h-5 text-[#5AB4C5]" />
              當前路線
            </h2>
            <Button variant="ghost" size="sm" className="text-[#5AB4C5]">
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <RouteCard />
        </section>

        {/* Explore Progress */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#22474E] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#5AB4C5]" />
              探索進度
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ExploreCard letter="A" progress={10} total={10} location="已抵達景點10:J景點" completed={true} />
            <ExploreCard letter="B" progress={2} total={10} location="已抵達景點2:B景點" completed={false} />
          </div>
        </section>

        {/* Weekly Progress */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#22474E] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#5AB4C5]" />
              每週計劃
            </h2>
          </div>
          <WeeklyProgress onWeekClick={handleWeekClick} />
        </section>
      </main>
    </div>
  )
}
