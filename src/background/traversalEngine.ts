import { getRuntimeKey, storage, type TraversalState } from "~lib/tabStorage"

function matchesSkipPatterns(url: string, skipPatterns?: string[]): boolean {
  if (!skipPatterns || skipPatterns.length === 0) return false
  return skipPatterns.some(pattern => {
    const normalized = pattern.replace(/\*+$/, "")
    return url.startsWith(normalized)
  })
}

const alarmName = (tabId: number) => `utt:alarm:${tabId}`
const badgeTimers = new Map<number, any>()

function updateBadge(tabId: number, nextRunAt: number) {
  if (badgeTimers.has(tabId)) clearInterval(badgeTimers.get(tabId))

  const tick = () => {
    const remaining = Math.max(0, Math.ceil((nextRunAt - Date.now()) / 1000))
    const text = remaining > 999 ? "999+" : remaining.toString()
    
    chrome.action.setBadgeText({ tabId, text })
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#10B981" }) // Emerald-500

    // Optional: we could clear interval if remaining <= 0 to save resources, 
    // but handleAlarm will trigger shortly anyway.
  }

  tick()
  badgeTimers.set(tabId, setInterval(tick, 1000))
}

function stopBadgeTimer(tabId: number) {
  if (badgeTimers.has(tabId)) {
    clearInterval(badgeTimers.get(tabId))
    badgeTimers.delete(tabId)
  }
}
function getRandomInterval(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}

export async function startTraversal(
  tabId: number,
  urls: string[],
  intervalMs: number,
  isRandom?: boolean,
  minIntervalMs?: number,
  maxIntervalMs?: number,
  skipPatterns?: string[]
) {
  const isFirstUrlSkipped = matchesSkipPatterns(urls[0], skipPatterns)

  if (isFirstUrlSkipped) {
    const state: TraversalState = {
      urls,
      currentIndex: 1 % urls.length,
      intervalMs: intervalMs,
      baseIntervalMs: intervalMs,
      isRunning: true,
      isPaused: true,
      nextRunAt: Date.now(),
      isRandom,
      minIntervalMs,
      maxIntervalMs,
      skipPatterns
    }
    await storage.set(getRuntimeKey(tabId), state)
    chrome.action.setBadgeText({ tabId, text: "PAUSE" })
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#F59E0B" })
    return
  }

  const currentIntervalMs = isRandom && minIntervalMs && maxIntervalMs
    ? getRandomInterval(minIntervalMs, maxIntervalMs)
    : intervalMs

  const state: TraversalState = {
    urls,
    currentIndex: 0,
    intervalMs: currentIntervalMs,
    baseIntervalMs: intervalMs,
    isRunning: true,
    isPaused: false,
    nextRunAt: Date.now() + currentIntervalMs,
    isRandom,
    minIntervalMs,
    maxIntervalMs,
    skipPatterns
  }

  await storage.set(getRuntimeKey(tabId), state)
  schedule(tabId, state.nextRunAt)
  updateBadge(tabId, state.nextRunAt)
}

export async function pauseTraversal(tabId: number) {
  const state = await storage.get<TraversalState>(getRuntimeKey(tabId))
  if (!state || !state.isRunning) return

  state.isPaused = true
  await storage.set(getRuntimeKey(tabId), state)

  await chrome.alarms.clear(alarmName(tabId))
  
  stopBadgeTimer(tabId)
  chrome.action.setBadgeText({ tabId, text: "PAUSE" })
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#F59E0B" }) // Amber-500
}

export async function resumeTraversal(tabId: number) {
  const state = await storage.get<TraversalState>(getRuntimeKey(tabId))
  if (!state || !state.isRunning || !state.isPaused) return

  let isFromSkipped = false
  try {
    const tab = await chrome.tabs.get(tabId)
    if (tab && tab.url) {
      isFromSkipped = matchesSkipPatterns(tab.url, state.skipPatterns)
    }
  } catch (err) {
    console.error("Failed to retrieve tab details for resume check:", err)
  }

  if (isFromSkipped) {
    const nextUrl = state.urls[state.currentIndex]
    await chrome.tabs.update(tabId, { url: nextUrl })

    state.currentIndex = (state.currentIndex + 1) % state.urls.length

    const isNextUrlSkipped = matchesSkipPatterns(nextUrl, state.skipPatterns)

    if (isNextUrlSkipped) {
      state.isPaused = true
      state.nextRunAt = Date.now()
      await storage.set(getRuntimeKey(tabId), state)
      
      stopBadgeTimer(tabId)
      chrome.action.setBadgeText({ tabId, text: "PAUSE" })
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#F59E0B" })
      return
    }

    const currentIntervalMs = state.isRandom && state.minIntervalMs && state.maxIntervalMs
      ? getRandomInterval(state.minIntervalMs, state.maxIntervalMs)
      : (state.baseIntervalMs ?? state.intervalMs)

    state.isPaused = false
    state.intervalMs = currentIntervalMs
    state.nextRunAt = Date.now() + currentIntervalMs

    await storage.set(getRuntimeKey(tabId), state)
    schedule(tabId, state.nextRunAt)
    updateBadge(tabId, state.nextRunAt)
  } else {
    const remaining =
      Math.max(0, state.nextRunAt - Date.now()) || state.intervalMs

    state.isPaused = false
    state.nextRunAt = Date.now() + remaining

    await storage.set(getRuntimeKey(tabId), state)
    schedule(tabId, state.nextRunAt)
    updateBadge(tabId, state.nextRunAt)
  }
}

export async function stopTraversal(tabId: number) {
  const state = await storage.get<TraversalState>(getRuntimeKey(tabId))

  await chrome.alarms.clear(alarmName(tabId))
  await storage.remove(getRuntimeKey(tabId))

  chrome.action.setBadgeText({ tabId, text: "" })
  stopBadgeTimer(tabId)
}

export async function handleAlarm(tabId: number) {
  const state = await storage.get<TraversalState>(getRuntimeKey(tabId))
  if (!state || !state.isRunning || state.isPaused) return

  const url = state.urls[state.currentIndex]
  await chrome.tabs.update(tabId, { url })

  state.currentIndex = (state.currentIndex + 1) % state.urls.length

  const isUrlSkipped = matchesSkipPatterns(url, state.skipPatterns)

  if (isUrlSkipped) {
    state.isPaused = true
    state.nextRunAt = Date.now()
    await storage.set(getRuntimeKey(tabId), state)
    
    stopBadgeTimer(tabId)
    chrome.action.setBadgeText({ tabId, text: "PAUSE" })
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#F59E0B" })
    return
  }

  const currentIntervalMs = state.isRandom && state.minIntervalMs && state.maxIntervalMs
    ? getRandomInterval(state.minIntervalMs, state.maxIntervalMs)
    : (state.baseIntervalMs ?? state.intervalMs)

  state.intervalMs = currentIntervalMs
  state.nextRunAt = Date.now() + currentIntervalMs

  await storage.set(getRuntimeKey(tabId), state)
  schedule(tabId, state.nextRunAt)
  updateBadge(tabId, state.nextRunAt)
}

function schedule(tabId: number, when: number) {
  chrome.alarms.create(alarmName(tabId), { when })
}
