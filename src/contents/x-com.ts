import type { PlasmoCSConfig } from "plasmo"
import { TwitterMouseTracker } from "../x-com/mouse-tracker";

// This tells Plasmo to only inject this script on Twitter/X.com
export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*", "https://x.com/*"],
  run_at: "document_idle",
}

// Initialize the tracker
export const tracker = new TwitterMouseTracker()
// Make it available globally for debugging
;(window as any).twitterTracker = tracker

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  tracker.destroy()
})
