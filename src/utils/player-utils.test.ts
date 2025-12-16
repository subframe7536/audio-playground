import { describe, test, expect } from 'bun:test'
import {
  findActiveLyric,
  formatTime,
  parseTimeToSeconds,
  calculateStaggerDelay,
  getAnimationTimings,
} from './player-utils'
import type { LrcObj } from './parse-lyric'

describe('player-utils', () => {
  describe('findActiveLyric', () => {
    const lyrics: LrcObj[] = [
      { index: 0, time: 10, rawContent: 'First line', transContent: '' },
      { index: 1, time: 20, rawContent: 'Second line', transContent: '' },
      { index: 2, time: 30, rawContent: 'Third line', transContent: '' },
    ]

    test('returns -1 for empty lyrics', () => {
      expect(findActiveLyric([], 15)).toBe(-1)
    })

    test('returns -1 when time is before first lyric', () => {
      expect(findActiveLyric(lyrics, 5)).toBe(-1)
    })

    test('returns correct index for time matching lyric', () => {
      expect(findActiveLyric(lyrics, 20)).toBe(1)
    })

    test('returns correct index for time between lyrics', () => {
      expect(findActiveLyric(lyrics, 25)).toBe(1)
    })

    test('returns last index for time after all lyrics', () => {
      expect(findActiveLyric(lyrics, 50)).toBe(2)
    })
  })

  describe('formatTime', () => {
    test('formats zero correctly', () => {
      expect(formatTime(0)).toBe('0:00')
    })

    test('formats seconds correctly', () => {
      expect(formatTime(45)).toBe('0:45')
    })

    test('formats minutes and seconds correctly', () => {
      expect(formatTime(125)).toBe('2:05')
    })

    test('handles negative numbers', () => {
      expect(formatTime(-10)).toBe('0:00')
    })

    test('handles infinity', () => {
      expect(formatTime(Infinity)).toBe('0:00')
    })

    test('handles NaN', () => {
      expect(formatTime(NaN)).toBe('0:00')
    })
  })

  describe('parseTimeToSeconds', () => {
    test('parses MM:SS format correctly', () => {
      expect(parseTimeToSeconds('2:30')).toBe(150)
    })

    test('parses MM:SS.xxx format correctly', () => {
      expect(parseTimeToSeconds('1:23.456')).toBe(83.456)
    })

    test('handles invalid format', () => {
      expect(parseTimeToSeconds('invalid')).toBe(0)
      expect(parseTimeToSeconds('1:2:3')).toBe(0)
    })

    test('handles non-numeric values', () => {
      expect(parseTimeToSeconds('a:b')).toBe(0)
    })
  })

  describe('calculateStaggerDelay', () => {
    test('calculates stagger delay correctly', () => {
      expect(calculateStaggerDelay(0, 50)).toBe(0)
      expect(calculateStaggerDelay(1, 50)).toBe(50)
      expect(calculateStaggerDelay(3, 25)).toBe(75)
    })
  })

  describe('getAnimationTimings', () => {
    test('returns correct timing values', () => {
      const timings = getAnimationTimings()
      expect(timings.lineMovement).toBe(400)
      expect(timings.highlighting).toBe(200)
      expect(timings.fading).toBe(150)
    })
  })
})
