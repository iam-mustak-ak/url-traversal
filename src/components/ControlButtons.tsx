import { Pause, Play, Square } from "lucide-react"

import { Button } from "./ui/Button"

interface ControlButtonsProps {
  isRunning: boolean
  isPaused: boolean
  canStart: boolean
  onStart: () => void
  onPause: () => void
  onEnd: () => void
}

const ControlButtons = ({
  isRunning,
  isPaused,
  canStart,
  onStart,
  onPause,
  onEnd
}: ControlButtonsProps) => {
  return (
    <div className="flex gap-3 justify-center">
      {!isRunning || isPaused ? (
        <Button
          onClick={onStart}
          disabled={!canStart}
          className="flex-1 h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium gap-2">
          <Play className="w-4 h-4" />
          {isPaused ? "Resume" : "Start"}
        </Button>
      ) : (
        <Button
          onClick={onPause}
          variant="secondary"
          className="flex-1 h-12 font-medium gap-2">
          <Pause className="w-4 h-4" />
          Pause
        </Button>
      )}

      <Button
        onClick={onEnd}
        variant="outline"
        disabled={!isRunning && !isPaused}
        className="flex-1 h-12 font-medium gap-2 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
        <Square className="w-4 h-4" />
        End
      </Button>
    </div>
  )
}

export default ControlButtons
