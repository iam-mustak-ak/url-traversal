import type { PlasmoMessaging } from "@plasmohq/messaging"

import { stopTraversal } from "../traversalEngine"

const handler: PlasmoMessaging.MessageHandler = async (req) => {
  await stopTraversal(req.body.tabId)
}

export default handler
