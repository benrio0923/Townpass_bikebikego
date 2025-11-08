import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation, Clock } from "lucide-react"

export function RouteCard() {
  const route = ["A景點", "B景點", "C景點", "D景點", "E景點", "F景點"]

  return (
    <Card className="border-4 border-[#5AB4C5] bg-gradient-to-br from-[#EDF8FA] via-[#FFFFFF] to-[#DBF1F5] overflow-hidden">
      <div className="p-6">
        {/* Route Letter Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#22474E] to-[#356C77] text-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl font-black">A</span>
            </div>
            <div>
              <Badge className="bg-[#71C5D5] text-white mb-2">進行中</Badge>
              <p className="text-sm text-[#356C77] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                預計 2.5 小時
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#71C5D5] to-[#5AB4C5] hover:from-[#5AB4C5] hover:to-[#468D9B] text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            START
          </Button>
        </div>

        {/* Route Path */}
        <div className="bg-[#FFFFFF] border-2 border-[#B4E2EA] rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-[#22474E] flex-wrap">
            <Navigation className="w-4 h-4 text-[#5AB4C5] flex-shrink-0" />
            <span className="font-semibold text-[#5AB4C5]">路線:</span>
            {route.map((point, index) => (
              <span key={index} className="flex items-center gap-2">
                <span className="font-medium">{point}</span>
                {index < route.length - 1 && <span className="text-[#5AB4C5]">→</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
