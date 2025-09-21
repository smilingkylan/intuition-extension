const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/contents/mouse-tracker.ts', 'utf8');

// Add import at the top after the header comment
const importStatement = 'import { sendToBackground } from "@plasmohq/messaging"\n\n';
content = content.replace(
  '/**\n * Twitter/X.com Mouse Tracker Content Script\n * Monitors mouse movements and detects when hovering over tweets\n */\n\n',
  '/**\n * Twitter/X.com Mouse Tracker Content Script\n * Monitors mouse movements and detects when hovering over tweets\n */\n\n' + importStatement
);

// Add new properties after pendingTweetData
const newProperties = `  private collectedUsernames: Set<string> = new Set()
  private atomCreationTimer: number | null = null
`;
content = content.replace(
  '  private pendingTweetData: TweetData | null = null\n',
  '  private pendingTweetData: TweetData | null = null\n' + newProperties
);

// Add new methods before the sendTweetData method
const newMethods = `
  private collectUsername(username: string) {
    if (username && !this.collectedUsernames.has(username)) {
      this.collectedUsernames.add(username)
      this.scheduleAtomCreation()
    }
  }

  private scheduleAtomCreation() {
    // Clear existing timer
    if (this.atomCreationTimer) {
      clearTimeout(this.atomCreationTimer)
    }

    // Schedule batch creation after 2 seconds of no new usernames
    this.atomCreationTimer = setTimeout(() => {
      this.createAtomsForCollectedUsernames()
    }, 2000)
  }

  private async createAtomsForCollectedUsernames() {
    const usernames = Array.from(this.collectedUsernames)
    if (usernames.length === 0) return

    console.log(\`Creating atoms for \${usernames.length} usernames:\`, usernames)

    try {
      await sendToBackground({
        name: "create-atoms",
        body: {
          usernames
        }
      })
      
      // Clear the collected usernames after sending
      this.collectedUsernames.clear()
    } catch (error) {
      console.error('Failed to trigger atom creation:', error)
    }
  }

`;
content = content.replace(
  '  private sendTweetData(data: TweetData | null) {',
  newMethods + '  private sendTweetData(data: TweetData | null) {'
);

// Update extractTweetData to collect usernames
content = content.replace(
  '  private extractTweetData(article: HTMLElement): TweetData {\n    const url = this.extractTweetUrl(article)\n    const tweetId = this.extractTweetId(url)',
  '  private extractTweetData(article: HTMLElement): TweetData {\n    const url = this.extractTweetUrl(article)\n    const tweetId = this.extractTweetId(url)\n    const username = this.extractUsername(article)\n    \n    // Collect username for atom creation\n    this.collectUsername(username)'
);

// Also need to fix the part where username is defined again
content = content.replace(
  '    const tweetId = this.extractTweetId(url)\n    const username = this.extractUsername(article)\n    \n    // Collect username for atom creation\n    this.collectUsername(username)\n    const username = this.extractUsername(article)',
  '    const tweetId = this.extractTweetId(url)\n    const username = this.extractUsername(article)\n    \n    // Collect username for atom creation\n    this.collectUsername(username)'
);

// Write the updated file
fs.writeFileSync('src/contents/mouse-tracker.ts', content);
console.log('Updated mouse-tracker.ts successfully');
