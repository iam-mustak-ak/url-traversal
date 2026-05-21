import type { PlasmoMessaging } from "@plasmohq/messaging"

import { startTraversal } from "../traversalEngine"

const handler: PlasmoMessaging.MessageHandler = async (req) => {
  const { tabId, urls, intervalMs, isRandom, minIntervalMs, maxIntervalMs, skipPatterns } = req.body
  await startTraversal(tabId, urls, intervalMs, isRandom, minIntervalMs, maxIntervalMs, skipPatterns)
}

export default handler
