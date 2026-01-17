import { useMemo } from "react"

interface CircularTimerProps {
  timeRemaining: number
  totalTime: number
  isRunning: boolean
}

const CircularTimer = ({
  timeRemaining,
  totalTime,
  isRunning
}: CircularTimerProps) => {
  const progress = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 100

  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const formatTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [timeRemaining])

  return (
    <div className="relative w-56 h-56 mx-auto">
      {/* Glow effect */}
      {isRunning && (
        <div className="absolute inset-0 rounded-full timer-glow animate-pulse-ring" />
      )}

      {/* SVG Timer Ring */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Track */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="hsl(var(--timer-track))"
          strokeWidth="4"
        />

        {/* Progress Ring */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="hsl(var(--timer-ring))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-light tracking-tight text-foreground">
          {formatTime}
        </span>
        <span className="text-sm text-muted-foreground mt-1">
          {isRunning ? "Next traversal" : "Ready"}
        </span>
      </div>
    </div>
  )
}

export default CircularTimer
