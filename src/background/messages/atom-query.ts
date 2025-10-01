import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // Atom queries are handled via chrome.runtime.onMessage
  // This handler is just to satisfy Plasmo's requirements
  res.send({ success: true })
}

export default handler 