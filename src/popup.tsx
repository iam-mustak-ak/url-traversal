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
  const [isRandom, setIsRandom] = useState(false)
  const [minInterval, setMinInterval] = useState("1")
  const [maxInterval, setMaxInterval] = useState("5")

  // Sync with background traversal state
  const [runtimeState] = useStorage<TraversalState>({
    key: tabId ? getRuntimeKey(tabId) : "waiting_for_tab",
    instance: storage
  })

  const isRunning = runtimeState?.isRunning ?? false
  const isPaused = runtimeState?.isPaused ?? false
  const intervalTime =
    isRunning && runtimeState
      ? Math.floor(runtimeState.intervalMs / 1000)
      : isRandom
      ? (parseFloat(minInterval) || 1) * 60
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
    if (isRandom) {
      const minVal = parseFloat(minInterval) || 1
      const maxVal = Math.max(minVal, parseFloat(maxInterval) || minVal + 1)
      await sendToBackground({
        name: "startTraversal",
        body: {
          tabId,
          urls,
          intervalMs: 0,
          isRandom: true,
          minIntervalMs: minVal * 60 * 1000,
          maxIntervalMs: maxVal * 60 * 1000
        }
      })
    } else {
      await sendToBackground({
        name: "startTraversal",
        body: {
          tabId,
          urls,
          intervalMs: localInterval * 1000,
          isRandom: false
        }
      })
    }
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

  // Synchronize local states with active runtimeState
  useEffect(() => {
    if (runtimeState && runtimeState.isRunning) {
      if (runtimeState.isRandom) {
        setIsRandom(true)
        if (runtimeState.minIntervalMs) {
          setMinInterval(String(runtimeState.minIntervalMs / 60000))
        }
        if (runtimeState.maxIntervalMs) {
          setMaxInterval(String(runtimeState.maxIntervalMs / 60000))
        }
      } else {
        setIsRandom(false)
        const seconds = Math.floor(runtimeState.intervalMs / 1000)
        setLocalInterval(seconds)
        if (seconds === 60 || seconds === 180 || seconds === 300) {
          setCustomInterval("")
        } else {
          setCustomInterval(String(seconds / 60))
        }
      }
    }
  }, [runtimeState])

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
            isRandom={isRandom}
            onRandomChange={setIsRandom}
            minInterval={minInterval}
            onMinIntervalChange={setMinInterval}
            maxInterval={maxInterval}
            onMaxIntervalChange={setMaxInterval}
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
        <div className="text-center space-y-2 opacity-80">
          <p className="text-xs text-muted-foreground opacity-60">
            The URLs will be iterated over at intervals
          </p>
          <a
            href="https://iam-mustak-ak.github.io/url-traversal/how-it-works"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-accent hover:text-accent/80 hover:underline font-medium transition-colors cursor-pointer"
          >
            How it works &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
