const LOG_COLORS = {
  PROFILE: '\x1b[35m',
  TWEET_BUTTONS: '\x1b[32m',
  STARTUP: '\x1b[33m',
  CELL_INNER_DIV: '\x1b[34m',
  SCROLL_SIDEBAR: '\x1b[36m',
}

const log = (
  prefix: string,
  color: keyof typeof LOG_COLORS,
  ...messages: any[]
) => {
  // Map ANSI colors to CSS colors
  const cssColors = {
    PROFILE: 'color: magenta',
    TWEET_BUTTONS: 'color: green',
    STARTUP: 'color: orange',
    CELL_INNER_DIV: 'color: blue',
    SCROLL_SIDEBAR: 'color: cyan',
  }

  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0')
  const timestamp = `${hours}:${minutes}:${seconds}.${milliseconds}`
  console.log(`%c${prefix}`, cssColors[color], `${timestamp}`, ...messages)
}

const logProfile = (...messages: any[]) => {
  log('[PROFILE]', 'PROFILE', ...messages)
}

const logTweetButtons = (...messages: any[]) => {
  log('[TWEET_BUTTONS]', 'TWEET_BUTTONS', ...messages)
}

const logStartup = (...messages: any[]) => {
  log('[STARTUP]', 'STARTUP', ...messages)
}

const logCellInnerDiv = (...messages: any[]) => {
  log('[CELL_INNER_DIV]', 'CELL_INNER_DIV', ...messages)
}

const logScrollSidebar = (...messages: any[]) => {
  log('[SCROLL_SIDEBAR]', 'SCROLL_SIDEBAR', ...messages)
}

export {
  logProfile,
  logTweetButtons,
  logStartup,
  logCellInnerDiv,
  logScrollSidebar,
}
