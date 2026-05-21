import { Input } from "./ui/Input"

interface IntervalSelectorProps {
  selectedInterval: number
  customInterval: string
  onIntervalChange: (interval: number) => void
  onCustomIntervalChange: (value: string) => void
  disabled: boolean
  isRandom: boolean
  onRandomChange: (value: boolean) => void
  minInterval: string
  onMinIntervalChange: (value: string) => void
  maxInterval: string
  onMaxIntervalChange: (value: string) => void
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
  disabled,
  isRandom,
  onRandomChange,
  minInterval,
  onMinIntervalChange,
  maxInterval,
  onMaxIntervalChange
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
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground">
          Interval Time
        </label>
        {/* Toggle Mode Segmented Control */}
        <div className="flex rounded-lg bg-secondary p-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRandomChange(false)}
            className={`py-1 px-3 text-xs font-medium rounded-md transition-all ${
              !isRandom
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                : "text-muted-foreground hover:text-foreground"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Fixed
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRandomChange(true)}
            className={`py-1 px-3 text-xs font-medium rounded-md transition-all ${
              isRandom
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                : "text-muted-foreground hover:text-foreground"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Random
          </button>
        </div>
      </div>

      {!isRandom ? (
        <div className="space-y-4">
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
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Min interval input */}
          <div className="relative">
            <span className="text-xs text-muted-foreground block mb-1">
              Min (min)
            </span>
            <div className="relative">
              <Input
                type="number"
                placeholder="Min"
                value={minInterval}
                onChange={(e) => onMinIntervalChange(e.target.value)}
                disabled={disabled}
                min={1}
                className="bg-secondary border-border/50 focus:border-accent h-12 pr-12 text-foreground"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                min
              </span>
            </div>
          </div>

          {/* Max interval input */}
          <div className="relative">
            <span className="text-xs text-muted-foreground block mb-1">
              Max (min)
            </span>
            <div className="relative">
              <Input
                type="number"
                placeholder="Max"
                value={maxInterval}
                onChange={(e) => onMaxIntervalChange(e.target.value)}
                disabled={disabled}
                min={1}
                className="bg-secondary border-border/50 focus:border-accent h-12 pr-12 text-foreground"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                min
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IntervalSelector
