import type { PlasmoMessaging } from "@plasmohq/messaging"

import { startTraversal } from "../traversalEngine"

const handler: PlasmoMessaging.MessageHandler = async (req) => {
  const { tabId, urls, intervalMs } = req.body
  await startTraversal(tabId, urls, intervalMs)
}

export default handler
