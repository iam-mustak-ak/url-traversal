import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import CircularTimer from "~components/CircularTimer"
import ControlButtons from "~components/ControlButtons"
import IntervalSelector from "~components/IntervalSelector"
import SkipRules from "~components/SkipRules"
import UrlInput from "~components/UrlInput"
import UrlList from "~components/UrlList"
import { getActiveTabsUrl } from "~lib/getActiveTabsUrl"
import {
  getPageUrlsKey,
  getPageSkipPatternsKey,
  getRuntimeKey,
  storage,
  type TraversalState
} from "~lib/tabStorage"

import "~style.css"

function IndexPopup() {
  const [tabId, setTabId] = useState<number | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Local state for configuration with manual persistence to avoid hook race conditions
  const [urls, setUrls] = useState<string[]>([])
  const [skipPatterns, setSkipPatterns] = useState<string[]>([])

  const safeUrls = urls ?? []
  const safeSkipPatterns = skipPatterns ?? []

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
    setUrls((prev) => [...(prev ?? []), url])
  }

  const handleDeleteUrl = (index: number) => {
    // If running, ideally we shouldn't allow deleting, or it won't affect running state
    // For now we allow it but it only affects local 'urls'
    if (index === 0) return
    setUrls((prev) => (prev ?? []).filter((_, i) => i !== index))
  }

  const handleStart = async () => {
    if (!tabId || safeUrls.length === 0) return

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
          urls: safeUrls,
          intervalMs: 0,
          isRandom: true,
          minIntervalMs: minVal * 60 * 1000,
          maxIntervalMs: maxVal * 60 * 1000,
          skipPatterns: safeSkipPatterns
        }
      })
    } else {
      await sendToBackground({
        name: "startTraversal",
        body: {
          tabId,
          urls: safeUrls,
          intervalMs: localInterval * 1000,
          isRandom: false,
          skipPatterns: safeSkipPatterns
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
      const updated = [...(prev ?? [])]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const handleAddSkipRule = (pattern: string) => {
    setSkipPatterns((prev) => {
      const current = prev ?? []
      if (current.includes(pattern)) return current
      return [...current, pattern]
    })
  }

  const handleDeleteSkipRule = (index: number) => {
    setSkipPatterns((prev) => (prev ?? []).filter((_, i) => i !== index))
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
        const seconds = Math.floor((runtimeState.baseIntervalMs ?? runtimeState.intervalMs) / 1000)
        setLocalInterval(seconds)
        if (seconds === 60 || seconds === 180 || seconds === 300) {
          setCustomInterval("")
        } else {
          setCustomInterval(String(seconds / 60))
        }
      }
    }
  }, [runtimeState])

  // Initialize Tab ID and load initial config
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

      const skipKey = getPageSkipPatternsKey(tabUrl)
      const storedSkipPatterns = await storage.get<string[]>(skipKey)
      if (storedSkipPatterns) {
        setSkipPatterns(storedSkipPatterns)
      }

      setIsLoaded(true)
    }

    init()
  }, [])

  // Persist URLs when changed
  useEffect(() => {
    if (!currentUrl || !isLoaded) return
    storage.set(getPageUrlsKey(currentUrl), urls)
  }, [urls, currentUrl, isLoaded])

  // Persist skip patterns when changed
  useEffect(() => {
    if (!currentUrl || !isLoaded) return
    storage.set(getPageSkipPatternsKey(currentUrl), skipPatterns)
  }, [skipPatterns, currentUrl, isLoaded])

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
            urls={isRunning && runtimeState ? runtimeState.urls : safeUrls}
            skipPatterns={isRunning && runtimeState ? runtimeState.skipPatterns : safeSkipPatterns}
            currentIndex={currentIndex}
            isRunning={isRunning && !isPaused}
            lockedIndex={0}
            onDelete={handleDeleteUrl}
            onReorder={handleReorder}
          />

          {/* Skip Timer Rules */}
          <SkipRules
            skipPatterns={isRunning && runtimeState ? (runtimeState.skipPatterns ?? []) : safeSkipPatterns}
            onAddRule={handleAddSkipRule}
            onDeleteRule={handleDeleteSkipRule}
            disabled={isRunning}
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
            canStart={safeUrls.length > 0}
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
