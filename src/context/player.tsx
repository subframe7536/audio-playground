import {
  createContext,
  useContext,
  createEffect,
  createResource,
  createSignal,
  createMemo,
} from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { createWaveformGenerator, parseTrack, ZAudio } from 'audio0'
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

const initialState: PlayerState = {
  // Playback state
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,

  // Lyric state
  activeLyricIndex: -1,
  lyrics: [],

  // Metadata
  metadata: null,

  // Audio ready state
  isAudioReady: false,

  // Waveform data
  waveform: null,

  // Loading state
  isLoading: false,

  // Error state
  error: null,
}

export function PlayerProvider(props: PlayerProviderProps) {
  // Initialize audio instance
  const audio = new ZAudio({
    mediaSession: true,
    volume: 0.8,
  })

  // Reactive state
  const [audioFile, setAudioFile] = createSignal<File | undefined>()
  const [state, setState] = createStore<PlayerState>(initialState)
  // Audio event handlers
  audio.on('play', () => setState('isPlaying', true))
  audio.on('pause', () => setState('isPlaying', false))
  audio.on('ended', () => setState('isPlaying', false))
  audio.on('volume', (volume) => setState('volume', volume))

  audio.on('timeupdate', (time) => {
    const roundedTime = Math.round(time * 100) / 100
    setState('currentTime', roundedTime)

    // Update active lyric index
    if (state.lyrics.length > 0) {
      let activeIndex = -1
      for (let i = 0; i < state.lyrics.length; i++) {
        if (state.lyrics[i].time <= roundedTime + 0.5) {
          activeIndex = i
        } else {
          break
        }
      }
      setState('activeLyricIndex', activeIndex)
    }
  })

  audio.on('load', () => {
    if (audio.duration && audio.duration > 0) {
      setState('duration', audio.duration)
    }
  })

  audio.on('error', (error) => {
    console.error('Audio playback error:', error)
    setState('isPlaying', false)
  })
  let cleanup: VoidFunction | undefined

  // Combined audio and metadata resource
  const [audioResource] = createResource(
    () => audioFile(),
    async (file) => {
      if (!file) {
        console.log('Clear')
        // Stop audio first to prevent events from firing during state reset
        await audio.stop()
        // Clean up previous track resources
        cleanup?.()
        cleanup = undefined
        // Reset state to initial values
        setState(initialState)
        return { metadata: null, audioReady: false }
      }

      cleanup?.()

      try {
        let parsedMetadata = await parseMetadata(file)

        setState(
          produce((s) => {
            if (parsedMetadata.lyric) {
              s.lyrics = parseLyric(parsedMetadata.lyric)
            }
            s.metadata = parsedMetadata
            s.duration = parsedMetadata.duration
          }),
        )

        // Load audio - handle File and URL differently
        const buffer = await file.arrayBuffer()
        createWaveformGenerator(buffer)
          .then((calc) => calc(48))
          .then((waveform) => (console.log(waveform), setState('waveform', waveform)))

        const [track, cleanupFn] = await parseTrack({ src: file })

        const audioReady = await audio.load(track)
        cleanup = cleanupFn

        setState('isAudioReady', audioReady)

        return {
          metadata: parsedMetadata,
          audioReady,
        }
      } catch (error) {
        console.warn('Failed to load audio/metadata:', error)

        // Return fallback metadata even if audio loading fails
        const fallbackMetadata: AudioMetadata = {
          title: file ? file.name.replace(/\.[^/.]+$/, '') : 'Demo Audio',
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: 0,
        }

        return {
          metadata: fallbackMetadata,
          audioReady: false,
        }
      }
    },
  )

  // Sync loading and error states
  createEffect(() => {
    setState({
      isLoading: audioResource.loading,
      error: audioResource.error || null,
    })
  })

  // Player actions
  const actions: PlayerActions = {
    play: async () => {
      if (!state.isAudioReady) {
        console.warn('Audio not ready yet, cannot play')
        return
      }
      await audio.play()
    },
    pause: () => audio.pause(),
    seek: (time: number) => audio.seek(time),
    setVolume: (volume: number) => {
      audio.volume = volume
    },
    hasFile: createMemo(() => !!audioFile()),
    setAudioFile,
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
