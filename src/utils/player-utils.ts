import {
  createFileFromBuffer,
  parseMetadata as parseTagMetadata,
  getPictureURL,
} from 'node-taglib-sharp-extend'
import type { AudioMetadata } from '~/types/player'
import type { LrcObj } from './parse-lyric'

/**
 * Extract metadata from an audio file
 */
export async function parseMetadata(file: File): Promise<AudioMetadata> {
  try {
    const buffer = await file.arrayBuffer()
    const uint8Buffer = new Uint8Array(buffer)
    const tagFile = createFileFromBuffer(file.name, uint8Buffer)
    const { tag, property, pictures } = parseTagMetadata(tagFile)

    let artwork: string | undefined
    if (pictures && pictures.length > 0) {
      const [artworkUrl] = getPictureURL(pictures[0])
      artwork = artworkUrl
    }

    return {
      title: tag.title || file.name.replace(/\.[^/.]+$/, ''),
      artist: tag.artists?.[0] || 'Unknown Artist',
      album: tag.album || 'Unknown Album',
      duration: property.duration / 1000,
      artwork,
      lyric: tag.lyrics,
    }
  } catch (error) {
    console.warn('Failed to parse metadata:', error)
    return {
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0,
    }
  }
}

/**
 * Find the index of the active lyric based on current time
 */
export function findActiveLyric(lyrics: LrcObj[], currentTime: number): number {
  if (!lyrics.length) {
    return -1
  }

  // Find the last lyric that has started (time <= currentTime)
  let activeIndex = -1
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime) {
      activeIndex = i
    } else {
      break
    }
  }

  return activeIndex
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '0:00'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Parse time string (MM:SS or MM:SS.xxx) to seconds
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':')
  if (parts.length !== 2) {
    return 0
  }

  const minutes = parseInt(parts[0], 10)
  const seconds = parseFloat(parts[1])

  if (isNaN(minutes) || isNaN(seconds)) {
    return 0
  }

  return minutes * 60 + seconds
}

/**
 * Calculate staggered animation delay for sequential animations
 */
export function calculateStaggerDelay(index: number, baseDelay: number): number {
  return index * baseDelay
}

/**
 * Get standard animation timing values
 */
export function getAnimationTimings() {
  return {
    lineMovement: 400,
    highlighting: 200,
    fading: 150,
  }
}
