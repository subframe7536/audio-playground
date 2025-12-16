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
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  activeLyricIndex: number
  metadata: AudioMetadata | null
  artwork: string | null
  lyrics: LrcObj[]
  // Audio ready state
  isAudioReady: boolean
  // Resource loading states
  isLoadingMetadata: boolean
  isLoadingAudio: boolean
  // Resource error states
  metadataError: Error | null
  audioError: Error | null
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
