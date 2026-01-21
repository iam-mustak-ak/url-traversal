import type { PlasmoMessaging } from "@plasmohq/messaging"

import { startTraversal } from "../traversalEngine"

export type StartTraversalBody = {
  tabId: number
  urls: string[]
  intervalMs: number
}

const handler: PlasmoMessaging.MessageHandler<StartTraversalBody> = async (
  req
) => {
  const { tabId, urls, intervalMs } = req.body
  await startTraversal(tabId, urls, intervalMs)
}

export default handler
