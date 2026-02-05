import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import CircularTimer from "~components/CircularTimer"
import ControlButtons from "~components/ControlButtons"
import IntervalSelector from "~components/IntervalSelector"
import UrlInput from "~components/UrlInput"
import UrlList from "~components/UrlList"
import { getActiveTabsUrl } from "~lib/getActiveTabsUrl"
import {
    getPageUrlsKey,
    getRuntimeKey,
    storage,
    type TraversalState
} from "~lib/tabStorage"

import "~style.css"

function IndexPopup() {
  const [tabId, setTabId] = useState<number | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  
  // Local state for configuration
  const [urls, setUrls] = useState<string[]>([])
  const [localInterval, setLocalInterval] = useState(60)
  const [customInterval, setCustomInterval] = useState("")

  // Sync with background traversal state
  const [runtimeState] = useStorage<TraversalState>(
    {
      key: tabId ? getRuntimeKey(tabId) : "waiting_for_tab",
      instance: storage
    }
  )

  const isRunning = runtimeState?.isRunning ?? false
  const isPaused = runtimeState?.isPaused ?? false
  const intervalTime = isRunning && runtimeState
    ? Math.floor(runtimeState.intervalMs / 1000)
    : localInterval
  
  const currentIndex = isRunning && runtimeState ? runtimeState.currentIndex : 0
  
  // Time remaining display
  const [timeRemaining, setTimeRemaining] = useState(localInterval)

  const handleAddUrl = (url: string) => {
    setUrls((prev) => [...prev, url])
  }

  const handleDeleteUrl = (index: number) => {
    // If running, ideally we shouldn't allow deleting, or it won't affect running state
    // For now we allow it but it only affects local 'urls'
    if (index === 0) return
    setUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStart = async () => {
    if (!tabId || urls.length === 0) return

    if (isPaused) {
      // Resume
      await sendToBackground({
        name: "resumeTraversal",
        body: { tabId }
      })
      return
    }

    // Start new
    await sendToBackground({
      name: "startTraversal",
      body: {
        tabId,
        urls,
        intervalMs: localInterval * 1000
      }
    })
  }

  const handlePause = async () => {
    if (!tabId) return
    await sendToBackground({
      name: "pauseTraversal",
      body: { tabId }
    })
  }

  const handleEnd = async () => {
    if (!tabId) return
    await sendToBackground({
      name: "stopTraversal",
      body: { tabId }
    })
  }

  const handleReorder = (from: number, to: number) => {
    setUrls((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  // Effect to update timeRemaining based on runtimeState
  useEffect(() => {
    if (!isRunning || isPaused || !runtimeState) {
      setTimeRemaining(intervalTime)
      return
    }

    const tick = () => {
      const remainingMs = runtimeState.nextRunAt - Date.now()
      setTimeRemaining(Math.max(0, Math.ceil(remainingMs / 1000)))
    }

    tick()
    const timer = setInterval(tick, 1000)

    return () => clearInterval(timer)
  }, [isRunning, isPaused, runtimeState, intervalTime])

  // Initialize Tab ID and load initial Config (URLs)
  useEffect(() => {
    const init = async () => {
      const tabUrl = await getActiveTabsUrl()
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (!tab?.id || !tabUrl) return

      setTabId(tab.id)
      setCurrentUrl(tabUrl)

      const key = getPageUrlsKey(tabUrl)
      const storedUrls = await storage.get<string[]>(key)

      if (storedUrls && storedUrls.length > 0) {
        setUrls(storedUrls)
      } else {
        const initialUrls = [tabUrl]
        setUrls(initialUrls)
        await storage.set(key, initialUrls)
      }
    }

    init()
  }, [])

  // Persist URLs when changed
  useEffect(() => {
    if (!currentUrl) return
    storage.set(getPageUrlsKey(currentUrl), urls)
  }, [urls, currentUrl])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 w-[500px]">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            URL Traversal Timer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cycle through URLs at set intervals
          </p>
        </div>

        {/* Timer */}
        <CircularTimer
          timeRemaining={timeRemaining}
          totalTime={intervalTime}
          isRunning={isRunning && !isPaused}
        />

        {/* Main Card */}
        <div className="glass rounded-2xl p-6 space-y-6">
          {/* URL Input */}
          <UrlInput onAdd={handleAddUrl} />

          {/* URL List */}
          <UrlList
            urls={isRunning && runtimeState ? runtimeState.urls : urls}
            currentIndex={currentIndex}
            isRunning={isRunning && !isPaused}
            lockedIndex={0}
            onDelete={handleDeleteUrl}
            onReorder={handleReorder}
          />

          {/* Interval Selector */}
          <IntervalSelector
            selectedInterval={localInterval}
            customInterval={customInterval}
            onIntervalChange={setLocalInterval}
            onCustomIntervalChange={setCustomInterval}
            disabled={isRunning}
          />

          {/* Control Buttons */}
          <ControlButtons
            isRunning={isRunning}
            isPaused={isPaused}
            canStart={urls.length > 0}
            onStart={handleStart}
            onPause={handlePause}
            onEnd={handleEnd}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground opacity-60">
          URLs open in new tabs automatically
        </p>
      </div>
    </div>
  )
}

export default IndexPopup
