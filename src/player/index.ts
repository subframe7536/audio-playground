// Re-export all player-related functionality
export { PlayerProvider, usePlayerContext } from '~/context/PlayerProvider'
export type {
  PlayerState,
  PlayerActions,
  PlayerContextValue,
  PlayerProviderProps,
  AudioMetadata,
} from '~/types/player'
export {
  parseMetadata,
  findActiveLyric,
  formatTime,
  parseTimeToSeconds,
  calculateStaggerDelay,
  getAnimationTimings,
} from '~/utils/player-utils'
export { parseLyric } from '~/utils/parse-lyric'
export type { LrcObj } from '~/utils/parse-lyric'
