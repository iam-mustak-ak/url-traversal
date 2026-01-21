import { Storage } from "@plasmohq/storage"

export const storage = new Storage({ area: "local" })

export const getTabUrlsKey = (tabId: number) => `utt:tab:${tabId}:urls`

export const getRuntimeKey = (tabId: number) => `utt:tab:${tabId}:runtime`
