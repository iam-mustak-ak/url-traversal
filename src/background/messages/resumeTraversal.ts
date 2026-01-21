import type { PlasmoMessaging } from "@plasmohq/messaging"

import { resumeTraversal } from "../traversalEngine"

const handler: PlasmoMessaging.MessageHandler = async (req) => {
  await resumeTraversal(req.body.tabId)
}

export default handler
