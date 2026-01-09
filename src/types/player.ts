import type { Accessor, JSX } from 'solid-js'
import type { LrcObj } from '~/utils/parse-lyric'

export interface AudioMetadata {
  title: string
  artist: string
  album: string
  duration: number
  artwork?: string
  lyrics?: string
  // Audio properties
  bitRate?: number // kbps
  bitDepth?: number // bits per sample
  sampleRate?: number // Hz
  channels?: number
  // Additional tag fields
  genres?: string[]
  year?: number
  track?: number
  trackTotal?: number
  disk?: number
  diskTotal?: number
  albumArtists?: string[]
  composers?: string[]
}

export interface PlayerState {
  // Playback state
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number

  // Lyric state
  activeLyricIndex: number
  lyrics: LrcObj[]

  // Metadata
  metadata: AudioMetadata | null

  // Waveform data
  waveform: number[] | null

  // Audio ready state
  isAudioReady: boolean

  // Loading state
  isLoading: boolean

  // Error state
  error: Error | null

  // Current audio file
  currentFile: File | null
}

export interface PlayerActions {
  play: () => Promise<void>
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setAudioFile: (file: File | undefined) => void
  hasFile: Accessor<boolean>
}

export type PlayerContextValue = readonly [PlayerState, PlayerActions]

export interface PlayerProviderProps {
  children: JSX.Element
}
