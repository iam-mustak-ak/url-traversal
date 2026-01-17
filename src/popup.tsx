import { useCallback, useEffect, useState } from "react"

import CircularTimer from "~components/CircularTimer"
import ControlButtons from "~components/ControlButtons"
import IntervalSelector from "~components/IntervalSelector"
import UrlInput from "~components/UrlInput"
import UrlList from "~components/UrlList"

import "~style.css"

function IndexPopup() {
  const [urls, setUrls] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [intervalTime, setIntervalTime] = useState(60) // seconds
  const [customInterval, setCustomInterval] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const handleAddUrl = (url: string) => {
    setUrls((prev) => [...prev, url])
  }

  const handleDeleteUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index))
    if (currentIndex >= urls.length - 1) {
      setCurrentIndex(0)
    }
  }

  const openNextUrl = useCallback(() => {
    if (urls.length === 0) return

    // const url = urls[currentIndex]
    // console.log(url)
    setCurrentIndex((prev) => (prev + 1) % urls.length)
    setTimeRemaining(intervalTime)
  }, [urls, currentIndex, intervalTime])

  const handleStart = () => {
    if (urls.length === 0) return

    if (isPaused) {
      setIsPaused(false)
      setIsRunning(true)
      return
    }

    setIsRunning(true)
    setIsPaused(false)
    setTimeRemaining(intervalTime)
    setCurrentIndex(0)

    // Open first URL immediately
    // window.open(urls[0], "_blank")
    // console.log(urls[0])

    // setCurrentIndex(1 % urls.length)
  }

  const handlePause = () => {
    setIsPaused(true)
    setIsRunning(false)
  }

  const handleEnd = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeRemaining(intervalTime)
    setCurrentIndex(0)
  }

  // Timer effect
  useEffect(() => {
    if (!isRunning || isPaused) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          openNextUrl()
          return intervalTime
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, isPaused, intervalTime, openNextUrl])

  // Update time remaining when interval changes (only when not running)
  useEffect(() => {
    if (!isRunning && !isPaused) {
      setTimeRemaining(intervalTime)
    }
  }, [intervalTime, isRunning, isPaused])

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
            urls={urls}
            currentIndex={currentIndex}
            isRunning={isRunning && !isPaused}
            onDelete={handleDeleteUrl}
          />

          {/* Interval Selector */}
          <IntervalSelector
            selectedInterval={intervalTime}
            customInterval={customInterval}
            onIntervalChange={setIntervalTime}
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
