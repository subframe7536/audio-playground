export interface LrcObj {
  index: number
  time: number
  rawContent: string
  transContent: string
}

export interface ParseLyricOptions {
  ignoreShortEmptyLines?: boolean
  /**
   * In second
   * @default 1
   */
  minEmptyLineDuration?: number
}

// 1. Static Regex to avoid recompilation
// Matches <mm:ss.xx> or [mm:ss.xx] anywhere (for cleanup)
const REG_TIME_TAG = /^\[(\d{1,2}):(\d{1,2})\.(\d{1,3})\]/
const REG_TIME_EXTRA = /[<[]\d{1,2}:\d{1,2}\.\d{1,3}[>\]]/g

/**
 * Fast parser for [mm:ss.xx] or [mm:ss.xxx] string to seconds number
 */
function parseTimeTag(timeString: string): number {
  const match = timeString.match(REG_TIME_TAG)

  if (!match) {
    throw new Error(`Invalid time format: "${timeString}"`)
  }

  const minutes = parseInt(match[1], 10)
  const seconds = parseInt(match[2], 10)
  const millisecondsStr = match[3]

  if (seconds >= 60) {
    throw new Error(`Invalid seconds value: ${seconds}. Seconds must be less than 60.`)
  }

  if (minutes < 0 || seconds < 0) {
    throw new Error(`Time values cannot be negative: ${minutes}:${seconds}`)
  }

  return Number.parseFloat(`${minutes * 60 + seconds}.${millisecondsStr}`)
}

interface RawLrc {
  time: number
  rawTime: string
  content: string
}

function parseRaw(lines: string[]): RawLrc[] {
  const ret: RawLrc[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Find timestamps that appear at the beginning of the line (before content)
    const leadingTimestamps: string[] = []
    let remainingLine = line

    // Extract leading timestamps
    let match
    while ((match = remainingLine.match(REG_TIME_TAG)) !== null) {
      leadingTimestamps.push(match[0])
      remainingLine = remainingLine.substring(match[0].length)
    }

    if (leadingTimestamps.length === 0) {
      continue
    }

    // Clean content: Remove all timestamps (including karaoke tags <...>) and trim
    const content = remainingLine.replace(REG_TIME_EXTRA, '').trim()

    // Create entries for all leading timestamps
    for (let j = 0; j < leadingTimestamps.length; j++) {
      const rawTime = leadingTimestamps[j]
      ret.push({
        time: parseTimeTag(rawTime),
        rawTime,
        content,
      })
    }
  }

  // Sort by time
  return ret.sort((a, b) => a.time - b.time)
}

export function parseLyric(sourceLrc: string, options?: ParseLyricOptions): LrcObj[] {
  // Handle empty input immediately
  if (!sourceLrc) {
    return []
  }

  const { ignoreShortEmptyLines = false, minEmptyLineDuration = 1 } = options || {}

  const lrcArr = sourceLrc.split(/[\r\n]+/)
  const parsedRaw = parseRaw(lrcArr)
  const normalizedLrc: LrcObj[] = []

  let index = 0
  const len = parsedRaw.length

  for (let i = 0; i < len; i++) {
    const current = parsedRaw[i]

    // Check next item for translation (same time check)
    // Using a small epsilon for float comparison safety, though usually exact string match implies exact time
    const next = parsedRaw[i + 1]
    const isDoubleLine = next && next.time === current.time && next.content

    // If current line is empty, merge consecutive empty lines
    if (!current.content) {
      // Find the next non-empty line to calculate duration
      let nextNonEmptyIndex = i + 1
      while (nextNonEmptyIndex < len && !parsedRaw[nextNonEmptyIndex].content) {
        nextNonEmptyIndex++
      }

      const nextTime = nextNonEmptyIndex < len ? parsedRaw[nextNonEmptyIndex].time : Number.POSITIVE_INFINITY
      const duration = nextTime - current.time

      // Skip short empty lines if option is enabled
      if (ignoreShortEmptyLines && duration < minEmptyLineDuration) {
        // Skip all consecutive empty lines
        i = nextNonEmptyIndex - 1
        continue
      }

      // Add the empty line
      normalizedLrc.push({
        index: index++,
        time: current.time,
        rawContent: current.content,
        transContent: '',
      })

      // Skip all consecutive empty lines (merge them into one)
      i = nextNonEmptyIndex - 1
      continue
    }

    normalizedLrc.push({
      index: index++,
      time: current.time,
      rawContent: current.content,
      transContent: isDoubleLine ? next.content : '',
    })

    // Skip the next line if it was used as translation
    if (isDoubleLine) {
      i++
    }
  }

  // Fallback: If no valid lyrics found, return the raw lines with -1 time
  if (normalizedLrc.length === 0) {
    // Check if it's a single line text or multiple
    if (lrcArr.length === 1 && lrcArr[0].trim()) {
      return [
        {
          index: 0,
          time: 0,
          rawContent: lrcArr[0].trim(),
          transContent: '',
        },
      ]
    }

    // Map all raw lines to untimed objects
    return lrcArr
      .filter((line) => line.trim())
      .map((line) => ({
        index: -1,
        time: -1,
        rawContent: line.trim(),
        transContent: '',
      }))
  }

  return normalizedLrc
}
