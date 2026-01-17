import { Input } from "./ui/Input"

interface IntervalSelectorProps {
  selectedInterval: number
  customInterval: string
  onIntervalChange: (interval: number) => void
  onCustomIntervalChange: (value: string) => void
  disabled: boolean
}

const presets = [
  { label: "1 min", value: 60 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 }
]

const IntervalSelector = ({
  selectedInterval,
  customInterval,
  onIntervalChange,
  onCustomIntervalChange,
  disabled
}: IntervalSelectorProps) => {
  const handleCustomChange = (value: string) => {
    onCustomIntervalChange(value)
    const seconds = parseInt(value) * 60
    if (!isNaN(seconds) && seconds > 0) {
      onIntervalChange(seconds)
    }
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-muted-foreground">
        Interval Time
      </label>

      {/* Preset buttons */}
      <div className="flex gap-3">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => {
              onIntervalChange(preset.value)
              onCustomIntervalChange("")
            }}
            disabled={disabled}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all
              ${
                selectedInterval === preset.value && !customInterval
                  ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}>
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom interval input */}
      <div className="relative">
        <Input
          type="number"
          placeholder="Custom interval"
          value={customInterval}
          onChange={(e) => handleCustomChange(e.target.value)}
          disabled={disabled}
          min={1}
          className="bg-secondary border-border/50 focus:border-accent h-12 pr-16"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          minutes
        </span>
      </div>
    </div>
  )
}

export default IntervalSelector
