import type { JSX } from 'solid-js'
import type { LrcObj } from '~/utils/parse-lyric'

export interface AudioMetadata {
  title: string
  artist: string
  album: string
  duration: number
  artwork?: string
  lyric?: string
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
  
  // Audio ready state
  isAudioReady: boolean
  
  // Loading state
  isLoading: boolean
  
  // Error state
  error: Error | null
}

export interface PlayerActions {
  play: () => Promise<void>
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
}

export type PlayerContextValue = readonly [PlayerState, PlayerActions]

export interface PlayerProviderProps {
  children: JSX.Element
  audioFile?: File
  autoPlay?: boolean
}
