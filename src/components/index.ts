// Main integrated music player component
export { MusicPlayerApp } from './MusicPlayerApp'
export type { MusicPlayerAppProps } from './MusicPlayerApp'

// Individual components (can be used separately if needed)
export { AudioControls } from './AudioControls'
export { BackgroundLayer } from './BackgroundLayer'
export { LyricsDisplay } from './LyricsDisplay'
export { MetadataDisplay } from './MetadataDisplay'
export { Icon } from './icon'

// Context and provider
export { PlayerProvider, usePlayerContext } from '../context/PlayerProvider'
