import { ChevronDown, ChevronUp, Info, Plus, Trash2, Zap } from "lucide-react"
import { useState } from "react"

import { Button } from "./ui/Button"
import { Input } from "./ui/Input"

interface SkipRulesProps {
  skipPatterns: string[]
  onAddRule: (pattern: string) => void
  onDeleteRule: (index: number) => void
  disabled?: boolean
}

export default function SkipRules({
  skipPatterns,
  onAddRule,
  onDeleteRule,
  disabled = false
}: SkipRulesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newRule, setNewRule] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newRule.trim()
    if (!trimmed) return

    onAddRule(trimmed)
    setNewRule("")
  }

  return (
    <div className="border border-border/40 rounded-xl bg-secondary/20 overflow-hidden transition-all duration-300">
      {/* Header / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/40 active:bg-secondary/50 transition text-left cursor-pointer focus:outline-none">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Skip Timer Rules ({skipPatterns.length})
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 border-t border-border/20 bg-secondary/10 space-y-4 animate-fade-in">
          {/* Info Tip */}
          <div className="flex gap-2 p-2.5 rounded-lg bg-accent/5 border border-accent/10 text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Skip wait delays for matching loaded URLs (transitions in exactly 1s). Supports prefixes and deep wildcards, e.g. <code className="text-accent bg-accent/10 px-1 py-0.5 rounded font-mono">https://www.fiverr.com/inbox/**</code>.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              disabled={disabled}
              placeholder="e.g. https://www.fiverr.com/inbox/"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              className="flex-1 h-9 bg-background/50 border-border/40 text-sm placeholder:text-muted-foreground/50"
            />
            <Button
              type="submit"
              size="sm"
              disabled={disabled || !newRule.trim()}
              className="h-9 shrink-0 px-3 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          {/* List of Rules */}
          {skipPatterns.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground/60 py-2">
              No skip rules defined yet.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {skipPatterns.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-background/40 hover:bg-background/60 border border-border/20 rounded-md py-1.5 px-2.5 group transition text-xs">
                  <span className="font-mono text-foreground/80 truncate max-w-[280px]" title={rule}>
                    {rule}
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => onDeleteRule(idx)}
                      className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded p-1 transition cursor-pointer"
                      title="Delete rule">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
