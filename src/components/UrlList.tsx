import { ExternalLink, Trash2 } from "lucide-react"

import { Button } from "./ui/Button"

interface UrlListProps {
  urls: string[]
  currentIndex: number
  isRunning: boolean
  onDelete: (index: number) => void
}

const UrlList = ({ urls, currentIndex, isRunning, onDelete }: UrlListProps) => {
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
      {urls.map((url, index) => (
        <div
          key={index}
          className={`url-item flex items-center justify-between px-4 py-3 rounded-lg group animate-fade-in ${
            isRunning && currentIndex === index
              ? "bg-accent/10 border border-accent/30"
              : "bg-secondary/50"
          }`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isRunning && currentIndex === index && (
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
            )}
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground truncate">
              {url.replace(/^https?:\/\//, "")}
            </span>
          </div>

          {!isRunning && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export default UrlList
