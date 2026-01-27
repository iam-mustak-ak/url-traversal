import { getRuntimeKey, storage, type TraversalState } from "~lib/tabStorage"

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
    isPaused: false,
    nextRunAt: Date.now() + intervalMs
  }

  await storage.set(getRuntimeKey(tabId), state)
  schedule(tabId, state.nextRunAt)
}

export async function pauseTraversal(tabId: number) {
  const state = await storage.get<TraversalState>(getRuntimeKey(tabId))
  if (!state || !state.isRunning) return

  state.isPaused = true
  await storage.set(getRuntimeKey(tabId), state)

  await chrome.alarms.clear(alarmName(tabId))
}

export async function resumeTraversal(tabId: number) {
  const state = await storage.get<TraversalState>(getRuntimeKey(tabId))
  if (!state || !state.isRunning || !state.isPaused) return

  const remaining =
    Math.max(0, state.nextRunAt - Date.now()) || state.intervalMs

  state.isPaused = false
  state.nextRunAt = Date.now() + remaining

  await storage.set(getRuntimeKey(tabId), state)
  schedule(tabId, state.nextRunAt)
}

export async function stopTraversal(tabId: number) {
  const state = await storage.get<TraversalState>(getRuntimeKey(tabId))

  await chrome.alarms.clear(alarmName(tabId))
  await storage.remove(getRuntimeKey(tabId))

  chrome.action.setBadgeText({ tabId, text: "" })
}

export async function handleAlarm(tabId: number) {
  const state = await storage.get<TraversalState>(getRuntimeKey(tabId))
  if (!state || !state.isRunning || state.isPaused) return

  const url = state.urls[state.currentIndex]
  await chrome.tabs.update(tabId, { url })

  state.currentIndex = (state.currentIndex + 1) % state.urls.length
  state.nextRunAt = Date.now() + state.intervalMs

  await storage.set(getRuntimeKey(tabId), state)
  schedule(tabId, state.nextRunAt)
}

function schedule(tabId: number, when: number) {
  chrome.alarms.create(alarmName(tabId), { when })
}
