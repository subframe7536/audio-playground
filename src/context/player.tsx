import { createContext, useContext, createEffect, createResource } from 'solid-js'
import { createStore, unwrap } from 'solid-js/store'
import { parseTrack, ZAudio } from 'audio0'
import type {
  PlayerState,
  PlayerActions,
  PlayerContextValue,
  PlayerProviderProps,
  AudioMetadata,
} from '~/types/player'
import { parseMetadata } from '~/utils/player-utils'
import { parseLyric } from '~/utils/parse-lyric'

const PlayerContext = createContext<PlayerContextValue>()

export function PlayerProvider(props: PlayerProviderProps) {
  // Initialize audio instance
  const audio = new ZAudio({
    mediaSession: true,
    volume: 0.8,
  })

  // Reactive state
  const [state, setState] = createStore<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    activeLyricIndex: -1,
    metadata: null,
    artwork: null,
    lyrics: [],
    // Audio ready state
    isAudioReady: false,
    // Resource loading states
    isLoadingMetadata: false,
    isLoadingAudio: false,
    // Resource error states
    metadataError: null,
    audioError: null,
  })
  // Audio event handlers with error handling
  audio.on('play', () => {
    setState('isPlaying', true)
  })

  audio.on('pause', () => {
    setState('isPlaying', false)
  })

  audio.on('timeupdate', (time) => {
    time = Math.round(time * 100) / 100
    setState('currentTime', time)
    for (let i = 0; i < state.lyrics.length; i++) {
      if (state.lyrics[i].time > time) {
        setState('activeLyricIndex', i - 1)
        break
      }
    }
  })

  audio.on('load', () => {
    if (audio.duration && audio.duration > 0) {
      setState('duration', audio.duration)
    }
  })

  audio.on('volume', (volume) => {
    setState('volume', volume)
  })

  audio.on('ended', () => {
    setState('isPlaying', false)
  })

  // Error event handler
  audio.on('error', (error) => {
    console.error('Audio playback error:', error)
    setState('isPlaying', false)
  })
  // Create resource for metadata parsing
  const [metadata] = createResource(
    () => props.audioFile,
    async (audioFile: File) => {
      if (!audioFile) {
        return null
      }

      console.log('Processing metadata for file:', audioFile.name)

      try {
        const parsedMetadata = await parseMetadata(audioFile)
        if (parsedMetadata.lyric) {
          const parsedLyrics = parseLyric(parsedMetadata.lyric)
          setState('lyrics', parsedLyrics)
        }
        console.log('Metadata parsed successfully:', parsedMetadata)
        console.log('Lyric:', unwrap(state.lyrics))
        return parsedMetadata
      } catch (error) {
        console.warn('Failed to parse metadata, using fallback values:', error)
        // Return fallback metadata
        const fallbackMetadata: AudioMetadata = {
          title: audioFile.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: 0,
        }
        console.log('Using fallback metadata:', fallbackMetadata)
        return fallbackMetadata
      }
    },
  )

  let _cleanup: VoidFunction

  // Create resource for audio loading
  const [audioData] = createResource(
    () => props.audioFile,
    async (audioFile: File) => {
      if (!audioFile) {
        return null
      }

      _cleanup?.()

      try {
        const [track, cleanup] = await parseTrack({ src: audioFile })
        console.log('Loading audio from URL:', track, audio.codecs)
        const result = await audio.load(track)
        _cleanup = cleanup

        // Load the audio file
        setState('isAudioReady', result)
        return { url: track.src, loaded: true, isObjectUrl: true }
      } catch (error) {
        console.error('Failed to load audio file:', error)
        throw new Error(
          `Audio loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    },
  )

  // Update state when metadata resource changes
  createEffect(() => {
    const metadataValue = metadata()
    if (metadataValue) {
      setState('metadata', metadataValue)
      setState('artwork', metadataValue.artwork || null)
      setState('duration', metadataValue.duration)
    }
  })

  // Track metadata loading state
  createEffect(() => {
    setState('isLoadingMetadata', metadata.loading)
    setState('metadataError', metadata.error || null)
  })

  // Track audio loading state
  createEffect(() => {
    setState('isLoadingAudio', audioData.loading)
    setState('audioError', audioData.error || null)
  })

  // Player actions with comprehensive error handling
  const actions: PlayerActions = {
    play: async () => {
      // Check if audio is ready before attempting to play
      if (!state.isAudioReady) {
        console.warn('Audio not ready yet, cannot play')
        return
      }

      await audio.play()
    },
    pause: () => {
      audio.pause()
    },
    seek: (time: number) => {
      audio.seek(time)
    },
    setVolume: (volume: number) => {
      audio.volume = volume
    },
  }

  return <PlayerContext.Provider value={[state, actions]}>{props.children}</PlayerContext.Provider>
}

export function usePlayerContext(): PlayerContextValue {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider')
  }
  return context
}
