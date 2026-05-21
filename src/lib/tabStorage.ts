import { Storage } from "@plasmohq/storage"

export type TraversalState = {
  urls: string[]
  currentIndex: number
  intervalMs: number
  isRunning: boolean
  isPaused: boolean
  nextRunAt: number
  isRandom?: boolean
  minIntervalMs?: number
  maxIntervalMs?: number
  skipPatterns?: string[]
  baseIntervalMs?: number
}

export const storage = new Storage({ area: "local" })

export const getTabUrlsKey = (tabId: number) => `utt:tab:${tabId}:urls`

export const getPageUrlsKey = (url: string) => `utt:page:${encodeURIComponent(url)}:urls`

export const getPageSkipPatternsKey = (url: string) => `utt:page:${encodeURIComponent(url)}:skipPatterns`

// This key is used for the active traversal state (background source of truth)
export const getRuntimeKey = (tabId: number) => `utt:tab:${tabId}:state`
