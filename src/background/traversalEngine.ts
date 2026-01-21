import { Storage } from "@plasmohq/storage"

type TraversalState = {
  urls: string[]
  currentIndex: number
  intervalMs: number
  isRunning: boolean
  isPaused: boolean
}

const storage = new Storage({ area: "local" })

const stateKey = (tabId: number) => `utt:tab:${tabId}:state`
const alarmName = (tabId: number) => `utt:alarm:${tabId}`

export async function startTraversal(
  tabId: number,
  urls: string[],
  intervalMs: number
) {
  const state: TraversalState = {
    urls,
    currentIndex: 0,
    intervalMs,
    isRunning: true,
    isPaused: false
  }

  await storage.set(stateKey(tabId), state)
  await scheduleNext(tabId, intervalMs)
}

export async function pauseTraversal(tabId: number) {
  const state = await storage.get<TraversalState>(stateKey(tabId))
  if (!state) return

  state.isPaused = true
  await storage.set(stateKey(tabId), state)
  await chrome.alarms.clear(alarmName(tabId))
}

export async function resumeTraversal(tabId: number) {
  const state = await storage.get<TraversalState>(stateKey(tabId))
  if (!state) return

  state.isPaused = false
  await storage.set(stateKey(tabId), state)
  await scheduleNext(tabId, state.intervalMs)
}

export async function stopTraversal(tabId: number) {
  await chrome.alarms.clear(alarmName(tabId))
  await storage.remove(stateKey(tabId))

  chrome.action.setBadgeText({
    tabId,
    text: ""
  })
}

export async function handleAlarm(tabId: number) {
  const state = await storage.get<TraversalState>(stateKey(tabId))
  if (!state || !state.isRunning || state.isPaused) return

  const url = state.urls[state.currentIndex]

  await chrome.tabs.update(tabId, { url })

  state.currentIndex = (state.currentIndex + 1) % state.urls.length
  await storage.set(stateKey(tabId), state)

  await scheduleNext(tabId, state.intervalMs)
}

async function scheduleNext(tabId: number, intervalMs: number) {
  chrome.action.setBadgeText({
    tabId,
    text: "▶"
  })

  chrome.alarms.create(alarmName(tabId), {
    when: Date.now() + intervalMs
  })
}
