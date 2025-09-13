export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getTimeMeasurement = (inMinutes: number): string => {
  switch (true) {
    case inMinutes < 1:
      return 'seconds'

    case inMinutes < 60:
      return 'minutes'

    case inMinutes < 1440:
      return 'hours'

    case inMinutes <= 84960:
      return 'days'

    default:
      return ''
  }
}

export const getTimeWithMeasurement = (
  inMinutes: number
): { measurement: string; value: number } => {
  const measurement = getTimeMeasurement(inMinutes)

  const measurements = {
    seconds(minutes) {
      const val = Math.round(minutes * 60)
      return val
    },
    minutes(minutes) {
      return minutes
    },
    hours(minutes) {
      return minutes / 60
    },
    days(minutes) {
      return minutes / 24 / 60
    },
  }
  const strategy = measurements[measurement]

  if (!strategy) {
    console.error(`No strategy for particular measurement: ${measurement}`)
    return { measurement: '', value: Infinity }
  }
  return {
    measurement,
    value: strategy(inMinutes),
  }
}
export const getTimeInMinutes = (params: {
  measurement: string
  value: number
}): number => {
  const { measurement, value } = params
  const measurementStrategies = {
    seconds(v) {
      const val = Math.round((v / 60) * 100) / 100
      return val
    },
    minutes(v) {
      return v
    },
    hours(v) {
      return v * 60
    },
    days(v) {
      return v * 24 * 60
    },
  }
  const strategy = measurementStrategies[measurement]

  if (!strategy) {
    console.error(`No strategy for particular measurement: ${measurement}`)
    return Infinity
  }
  return strategy(value)
}

export const secondsToHms = (seconds: number): string => {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  if (d > 0) return `${d}d`
  const h = Math.floor(seconds / 3600)
  if (h > 0) return `${h}h`
  const m = Math.floor((seconds % 3600) / 60)
  if (m > 0) return `${m}m`
  const s = Math.floor((seconds % 3600) % 60)
  if (s > 0) return `${s}s`
  return ''
}

export const timeAgo = (date: Date | string, ago: boolean = true): string => {
  let output
  if (typeof date === 'string') {
    if (date.length === 10) {
      output = new Date(parseInt(date) * 1000)
    } else if (date.length === 13) {
      output = new Date(parseInt(date))
    } else {
      output = new Date(date)
    }
  } else {
    output = date
  }
  // must add '+00:00' to tell Javascript to use GMT time zone
  const dateTimestamp = output.getTime() / 1000
  const nowTimestamp = Date.now() / 1000
  const timeGap = secondsToHms(nowTimestamp - dateTimestamp)
  let timeSyntax
  if (ago) {
    timeSyntax = `${timeGap} ago`
  } else {
    timeSyntax = timeGap
  }
  return timeSyntax
}

export const secondsToDhms = (inputVar: string | number): string => {
  const inputNumber = Number(inputVar)
  const days: number | string = Math.floor(inputNumber / (3600 * 24))
  const hours: number | string = Math.floor((inputNumber % (3600 * 24)) / 3600)
  const minutes: number | string = Math.floor(
    ((inputNumber % (3600 * 24)) % 3600) / 60
  )
  const seconds: number | string = Math.floor(
    ((inputNumber % (3600 * 24)) % 3600) % 60
  )

  if (days) return `${days} d`
  if (hours) return `${hours} h`
  if (minutes) return `${minutes} m`
  if (seconds) return `${seconds} s`
}

export const secondsToDDHHMMSS = (inputVar: string | number): string => {
  const inputNumber = Number(inputVar) / 1000
  let days: number | string = Math.floor((inputNumber / 3600) * 24)
  let hours: number | string = Math.floor((inputNumber % (3600 * 24)) / 3600)
  let minutes: number | string = Math.floor((inputNumber - hours * 3600) / 60)
  let seconds: number | string = Math.floor(
    inputNumber - hours * 3600 - minutes * 60
  )
  if (days < 1) {
    days = ''
  } else {
    days = days < 10 ? `0${days}:` : `${days}`
  }
  if (hours < 1) {
    hours = ''
  } else {
    hours = hours < 10 ? `0${hours}:` : `${hours}`
  }
  if (minutes < 10) minutes = `0${minutes}`
  if (seconds < 10) seconds = `0${seconds}`
  return `${days}:${hours}:${minutes}:${seconds}`
}

export function capitalizeWord(string: string): string {
  if (!string) return ''
  const firstLetter = string.charAt(0).toUpperCase()
  const otherLetters = string.slice(1)
  return `${firstLetter}${otherLetters}`
}

export const capitalize = (phrase: string) => {
  const capitalizedWords = phrase
    .split(' ')
    .map((word: string) => capitalizeWord(word))
  const capitalizedString = capitalizedWords.join(' ')
  return capitalizedString
}
export const getDaysInMonth = (month, year) =>
  // Here January is 1 based
  // Day 0 is the last day in the previous month
  new Date(year, month, 0).getDate()

export const ellipsizeString = (
  str: string | undefined | null,
  length: number
) => {
  if (!str) return ''
  if (str.length < length) return str
  const first = str.substring(0, length / 2)
  const second = str.substring(str.length - length / 2, str.length)
  const combined = [first, second].join('...')
  return combined
}

export const ellipsizeHex = (hex: string, length: number = 12): string => {
  if (!hex || !hex.startsWith('0x')) throw new Error('Invalid hex')
  const prefix = '0x'
  const payload = hex.replace('0x', '')
  const shortenedPayload = ellipsizeString(payload, length)
  return `${prefix}${shortenedPayload}`
}

export const truncateString = (
  str: string | undefined | null = '',
  length: number
) => {
  if (!str) return ''
  if (str.length < length) return str
  const truncatedString = str.substring(0, length)
  const finalSyntax = `${truncatedString}...`
  return finalSyntax
}

export const getFixedXProfileImageUrl = (url: string = ''): string => {
  console.log('getFixedXProfileImageUrl', url)
  if (
    !url ||
    !(
      url.includes('_normal.') ||
      url.includes('_mini.') ||
      url.includes('_x96.')
    )
  )
    return url
  let fixedUrl
  try {
    let splitUrl: string[]
    if (url.includes('_normal.')) {
      // console.log('url.includes(_normal.)')
      splitUrl = url.split('_normal.')
    } else if (url.includes('_mini.')) {
      // console.log('url.includes(_mini.)')
      splitUrl = url.split('_mini.')
    } else if (url.includes('_x96.')) {
      // console.log('url.includes(_x96.)')
      splitUrl = url.split('_x96.')
    }
    // console.log('splitUrl', splitUrl)
    fixedUrl =
      splitUrl.slice(0, -1).join('') + '_400x400.' + splitUrl.slice(-1)[0]
    // console.log('fixedUrl', fixedUrl)
  } catch (error) {
    console.error('Error getting fixed X profile image URL', error)
    return url
  }
  return fixedUrl
}

export const shortenLabel = (
  label: string | null | undefined,
  length: number = 50 // ✅ Default value when not provided
): string => {
  // ✅ Removed console.log to stop log spam
  if (!label) return ''

  // Handle hex addresses
  if (label.startsWith('0x')) {
    return ellipsizeHex(label, 12)
  }

  // Handle IPFS
  if (label.startsWith('bafkre')) {
    return ellipsizeString(label, 12)
  }
  if (label.startsWith('ipfs://bafkre')) {
    return ellipsizeString(label.replace('ipfs://', ''), 12)
  }

  // Handle URLs
  if (label.startsWith('https://')) {
    return label.replace('https://', '')
  }

  // ✅ NEW: Handle DID URIs
  if (label.startsWith('did:')) {
    // Extract meaningful parts of DID
    if (label.includes('eip155:') && label.includes('|discord:')) {
      const parts = label.split('|')
      const ethPart = parts[0] // did:eip155:84532:0x...
      const discordPart = parts[1] // discord:391378559945670667

      // Extract just the address from the first part
      const addressMatch = ethPart.match(/0x[a-fA-F0-9]+/)
      const address = addressMatch ? ellipsizeHex(addressMatch[0], 8) : ethPart

      return `${address} | ${discordPart}`
    }

    // Fallback for other DID formats
    return ellipsizeString(label, length)
  }

  // Default: truncate to specified length
  return label.length > length ? label.slice(0, length) + '...' : label
}
