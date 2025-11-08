import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ExploreCardProps {
  letter: string
  progress: number
  total: number
  location?: string
  completed?: boolean
}

export function ExploreCard({ letter, progress, total, location, completed = false }: ExploreCardProps) {
  const progressPercent = (progress / total) * 100

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-4 transition-all hover:scale-[1.02] hover:shadow-xl",
        completed
          ? "border-[#5AB4C5] bg-gradient-to-br from-[#EDF8FA] to-[#FFFFFF]"
          : "border-[#93D4DF] bg-gradient-to-br from-[#FFFFFF] to-[#EDF8FA]",
      )}
    >
      <div className="p-8">
        {location && (
          <div className="mb-4">
            <Badge
              variant="secondary"
              className={cn(
                "text-sm font-medium px-4 py-2",
                completed ? "bg-[#5AB4C5] text-white" : "bg-[#DBF1F5] text-[#22474E]",
              )}
            >
              {location}
            </Badge>
          </div>
        )}

        {/* Large Letter */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className={cn("text-[120px] font-black leading-none", completed ? "text-[#5AB4C5]" : "text-[#22474E]")}
              style={{
                WebkitTextStroke: completed ? "0px" : "2px #22474E",
                paintOrder: "stroke fill",
              }}
            >
              {letter}
            </div>
            {/* Small decorative dot */}
            <div
              className={cn(
                "absolute bottom-2 right-2 w-8 h-8 rounded-full",
                completed ? "bg-[#71C5D5]" : "bg-[#93D4DF]",
              )}
            />
          </div>
        </div>

        {/* Progress Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#22474E]">探索進度</span>
            <span className="text-2xl font-black text-[#5AB4C5]">
              {progress}/{total}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-[#DBF1F5] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                completed
                  ? "bg-gradient-to-r from-[#5AB4C5] to-[#71C5D5]"
                  : "bg-gradient-to-r from-[#93D4DF] to-[#5AB4C5]",
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
