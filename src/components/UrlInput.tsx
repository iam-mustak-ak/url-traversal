import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "./ui/Button"
import { Input } from "./ui/Input"

interface UrlInputProps {
  onAdd: (url: string) => void
}

const UrlInput = ({ onAdd }: UrlInputProps) => {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    // Add protocol if missing
    let formattedUrl = url.trim()
    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = "https://" + formattedUrl
    }

    onAdd(formattedUrl)
    setUrl("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="text"
        placeholder="Enter URL (e.g., google.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 bg-secondary border-border/50 focus:border-accent h-12"
      />
      <Button
        type="submit"
        disabled={!url.trim()}
        className="h-12 px-6 bg-accent hover:bg-accent/90 text-accent-foreground font-medium gap-2">
        <Plus className="w-4 h-4" />
        Add
      </Button>
    </form>
  )
}

export default UrlInput
