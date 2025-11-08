import { Card } from "@/components/ui/card"
import { MapPin, Heart, Book, Calendar, Bus, Info } from "lucide-react"

export function ServiceGrid() {
  const services = [
    { icon: MapPin, label: "找地點", color: "from-[#5AB4C5] to-[#71C5D5]" },
    { icon: Heart, label: "親子館", color: "from-[#93D4DF] to-[#5AB4C5]" },
    { icon: Book, label: "圖書借閱", color: "from-[#71C5D5] to-[#468D9B]" },
    { icon: Calendar, label: "活動報名", color: "from-[#468D9B] to-[#356C77]" },
    { icon: Bus, label: "交通資訊", color: "from-[#5AB4C5] to-[#93D4DF]" },
    { icon: Info, label: "即時資訊", color: "from-[#71C5D5] to-[#5AB4C5]" },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {services.map((service, index) => {
        const Icon = service.icon
        return (
          <Card
            key={index}
            className="border-2 border-[#B4E2EA] bg-white hover:border-[#5AB4C5] hover:scale-105 transition-all cursor-pointer"
          >
            <div className="p-6 flex flex-col items-center gap-3">
              <div
                className={`bg-gradient-to-br ${service.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#22474E] text-center">{service.label}</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
