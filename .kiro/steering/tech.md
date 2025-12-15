# Technology Stack

## Core Framework
- **SolidJS**: Reactive UI framework with fine-grained reactivity
- **TypeScript**: Strict type checking with ESNext target
- **Vite**: Build tool using Rolldown (faster Rust-based bundler)

## Key Libraries

### Audio Processing
- **audio0**: Modern audio library with fade effects, media session support, and playlist management
  - Single audio & playlist support with `ZAudio` and `ZPlayer` classes
  - Auto fade in/out transitions (customizable duration)
  - Media session integration for native controls
  - Advanced shuffle algorithms with artist weighting
  - Smart preloading and audio context control
  - Stream & buffer support for various audio sources
  - Loop modes: list, single, random
  - Automatic retry logic for network failures
  - Battery optimization with auto-suspend

- **node-taglib-sharp-extend**: Enhanced audio metadata extraction library
  - Read/write support for files in buffer format
  - Comprehensive metadata parsing: title, artists, album, track numbers, genres, etc.
  - Audio property analysis: bitrate, sample rate, duration, channels, codecs
  - Picture/artwork extraction with base64 and URL utilities
  - Browser support with Vite plugin and polyfills
  - Web Worker compatibility checking
  - Supports multiple audio formats including MP3, M4A, FLAC, etc.

### Styling
- **UnoCSS**: Atomic CSS with Tailwind-compatible utilities

## Build System
- **Runtime**: Bun (JavaScript runtime and package manager)
- **Bundler**: Vite with Rolldown for faster builds
- **Linting**: Oxlint (Rust-based linter) with comprehensive rules
- **Testing**: Vitest with Happy DOM environment

## Test

- **bun:test**: Bun's built-in tester. No browser support.

## Common Commands

### Development
```bash
bun dev          # Start development server
bun build        # Build for production
bun lint         # Run linter
bun typecheck    # TypeScript type checking
```

### Testing & Release
```bash
bun test         # Run tests once (no watch mode)
bun release      # Test + version bump
```

## Library Usage Examples

### Audio Playback (audio0)
```ts
import { ZAudio, ZPlayer } from 'audio0'

// Single audio with fade effects
const audio = new ZAudio({
  mediaSession: true,
  fadeDuration: 1000,
  volume: 0.8,
  autoSuspend: true
})

// Playlist player
const player = new ZPlayer({
  trackList: tracks,
  autoNext: true,
  loopMode: 'list',
  preload: { enable: true, threshold: 80 }
})

// Event handling
audio.on('timeupdate', (time) => console.log('Current time:', time))
player.on('loadTrack', (index, track) => console.log('Loaded:', track.title))
```

### Metadata Extraction (node-taglib-sharp-extend)
```ts
import { 
  createFileFromBuffer, 
  parseMetadata, 
  getPictureURL,
  updateTag 
} from 'node-taglib-sharp-extend'

// Parse metadata from uploaded file
const file = await createFileFromBuffer('audio.mp3', buffer)
const { tag, property, pictures } = parseMetadata(file)

// Extract artwork
const [artworkUrl, cleanup] = getPictureURL(pictures[0])

// Update metadata
updateTag(file, 'title', 'New Title')
```

## Configuration Notes
- Uses ES modules (`"type": "module"`)
- Strict TypeScript configuration with `noEmit`
- Path aliases: `~/*` maps to `./src/*`
- JSX preserved with SolidJS import source
- Vite plugin available for node-taglib-sharp-extend browser polyfills