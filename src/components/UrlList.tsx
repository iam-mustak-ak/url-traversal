import { ExternalLink, GripVertical, Trash2, Zap } from "lucide-react"
import { useRef } from "react"

import { Button } from "./ui/Button"

interface UrlListProps {
  urls: string[]
  skipPatterns?: string[]
  currentIndex: number
  isRunning: boolean
  lockedIndex?: number
  onDelete: (index: number) => void
  onReorder: (from: number, to: number) => void
}

const UrlList = ({
  urls,
  skipPatterns,
  currentIndex,
  isRunning,
  lockedIndex = 0,
  onDelete,
  onReorder
}: UrlListProps) => {
  const dragIndex = useRef<number | null>(null)

  if (urls.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p className="text-sm">No URLs added yet</p>
        <p className="text-xs mt-1 opacity-60">Add URLs to start cycling</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {urls.map((url, index) => {
        const isLocked = index === lockedIndex
        const isActive = isRunning && currentIndex === index
        const isSkipped = skipPatterns?.some(pattern => {
          const normalized = pattern.replace(/\*+$/, "")
          return url.startsWith(normalized)
        }) ?? false

        return (
          <div
            key={index}
            draggable={!isLocked && !isRunning}
            onDragStart={() => {
              if (isLocked || isRunning) return
              dragIndex.current = index
            }}
            onDragOver={(e) => {
              if (isLocked || isRunning) return
              e.preventDefault()
            }}
            onDrop={() => {
              if (
                isLocked ||
                isRunning ||
                dragIndex.current === null ||
                dragIndex.current === index
              )
                return

              onReorder(dragIndex.current, index)
              dragIndex.current = null
            }}
            className={`url-item flex items-center justify-between px-4 py-3 rounded-lg group animate-fade-in transition
              ${
                isActive
                  ? "bg-accent/10 border border-accent/30"
                  : "bg-secondary/50"
              }
              ${
                !isLocked && !isRunning
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-default opacity-70"
              }`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Active indicator */}
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
              )}

              {/* Drag handle */}
              {!isLocked && !isRunning && (
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 opacity-40 group-hover:opacity-100" />
              )}

              {/* Link icon */}
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />

              {/* URL */}
              <span className="text-sm text-foreground truncate">
                {isLocked && "Start URL — "}
                {url.replace(/^https?:\/\//, "")}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Skip Timer Indicator */}
              {isSkipped && (
                <div
                  title="This URL matches a skip rule and will transition in 1s"
                  className="flex items-center justify-center h-8 w-8 text-amber-500 bg-amber-500/10 rounded-md transition-all shrink-0">
                  <Zap className="w-4 h-4 fill-amber-500/20 animate-pulse" />
                </div>
              )}

              {/* Delete */}
              {!isLocked && !isRunning && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity
                    text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default UrlList
