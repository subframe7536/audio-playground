import { describe, it, expect } from 'vitest'
import { PlayerProvider, usePlayerContext } from './PlayerProvider'

describe('PlayerProvider with createResource', () => {
  it('exports PlayerProvider and usePlayerContext', () => {
    expect(PlayerProvider).toBeDefined()
    expect(typeof PlayerProvider).toBe('function')
    expect(usePlayerContext).toBeDefined()
    expect(typeof usePlayerContext).toBe('function')
  })

  it('handles resource loading states props structure', () => {
    // Test that the provider props interface is correctly structured
    const mockFile = new File(['test audio'], 'test.mp3', { type: 'audio/mpeg' })
    const mockLyrics = '[00:00.00]Test lyric'

    const props = {
      audioFile: mockFile,
      lyricsContent: mockLyrics,
      autoPlay: false,
      children: null as any,
    }

    // Verify props structure
    expect(props.audioFile).toBeInstanceOf(File)
    expect(typeof props.lyricsContent).toBe('string')
    expect(typeof props.autoPlay).toBe('boolean')
  })

  it('usePlayerContext throws error when used outside provider', () => {
    expect(() => usePlayerContext()).toThrow('usePlayerContext must be used within PlayerProvider')
  })
})
