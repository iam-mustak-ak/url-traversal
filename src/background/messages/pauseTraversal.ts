import type { PlasmoMessaging } from "@plasmohq/messaging"

import { pauseTraversal } from "../traversalEngine"

const handler: PlasmoMessaging.MessageHandler = async (req) => {
  await pauseTraversal(req.body.tabId)
}

export default handler
