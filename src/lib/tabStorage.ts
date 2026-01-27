import { Storage } from "@plasmohq/storage"

export type TraversalState = {
  urls: string[]
  currentIndex: number
  intervalMs: number
  isRunning: boolean
  isPaused: boolean
  nextRunAt: number
}

export const storage = new Storage({ area: "local" })

export const getTabUrlsKey = (tabId: number) => `utt:tab:${tabId}:urls`

// This key is used for the active traversal state (background source of truth)
export const getRuntimeKey = (tabId: number) => `utt:tab:${tabId}:state`
