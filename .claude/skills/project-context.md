---
name: project-context
description: Provides comprehensive project context including product overview, structure, and technology stack
---

# Audio Playground Project Context

You are a specialized agent that provides comprehensive context about the Audio Playground project. When invoked, provide relevant information about the project's purpose, structure, and technology stack.

## Product Overview

Audio Playground is a web application for audio file management and playback with advanced features:

### Core Features
- **Audio File Upload**: Support for various audio formats
- **Metadata Analysis**: Extract and display audio metadata using `node-taglib-sharp-extend`
- **Audio Playback Control**: Advanced playback controls powered by `audio0` library
- **Lyric Synchronization**: Real-time lyric display with auto-scroll and smooth animations

### Target Use Case
Interactive audio playground for developers and users who need comprehensive audio file analysis and synchronized playback experiences.

## Project Structure

### Root Directory
```
├── src/                    # Source code
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── .kiro/                 # Kiro configuration and steering
├── node_modules/          # Dependencies
├── package.json           # Project configuration
├── index.html             # HTML entry point
├── vite.config.ts         # Vite build configuration
├── tsconfig.json          # TypeScript configuration
├── unocss.config.ts       # UnoCSS styling configuration
└── README.md              # Project documentation
```

### Code Organization

#### Entry Points
- `src/index.tsx`: Application bootstrap, imports UnoCSS and renders App
- `src/App.tsx`: Main application component
- `index.html`: HTML template with `#app` mount point

#### Configuration Files
- `vite.config.ts`: Vite + SolidJS + UnoCSS plugins
- `tsconfig.json`: Strict TypeScript with path aliases
- `unocss.config.ts`: Wind preset + variant group transformer
- `.oxlintrc.json`: Comprehensive linting rules including SolidJS-specific rules

### Naming Conventions
- **Components**: PascalCase with `.tsx` extension
- **Functions**: Export named functions (e.g., `export function App()`)
- **Imports**: Use consistent type imports with `import type`
- **CSS Classes**: UnoCSS utility classes (Tailwind-compatible)

### File Patterns
- Keep components in `src/` directory
- Use TypeScript for all source files
- Import `uno.css` in entry point for styling
- Follow SolidJS reactivity patterns

## Technology Stack

### Core Framework
- **SolidJS**: Reactive UI framework with fine-grained reactivity
- **TypeScript**: Strict type checking with ESNext target
- **Vite**: Build tool using Rolldown (faster Rust-based bundler)

### Key Libraries

#### Audio Processing
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

#### Styling
- **UnoCSS**: Atomic CSS with Tailwind-compatible utilities

### Build System
- **Runtime**: Bun (JavaScript runtime and package manager)
- **Bundler**: Vite with Rolldown for faster builds
- **Linting**: Oxlint (Rust-based linter) with comprehensive rules
- **Testing**: Bun's built-in tester (no browser support)

## Common Commands

### Development
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run lint         # Run linter
bun run typecheck    # TypeScript type checking
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

## When to Use This Skill

Invoke this skill when you need to:
- Understand the overall project architecture
- Reference available libraries and their usage
- Check project structure and file organization conventions
- Look up common commands and development workflows
- Understand the technology choices and their purposes
