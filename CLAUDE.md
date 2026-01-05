# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Audio Playground is a web-based audio player application built with SolidJS. It allows users to upload audio files, view metadata, control playback, and display synchronized lyrics with auto-scrolling.

## Development Commands

```bash
# Start development server
bun dev

# Build for production
bun run build

# Run linter
bun run lint

# Type checking
bun run typecheck

# Run tests
bun test

# Run specific test file
bun test src/utils/parse-lyric.test.ts
```

## Tech Stack

- **Framework**: SolidJS (reactive UI framework)
- **Runtime**: Bun (used with `--bun` flag for dev and build)
- **Build Tool**: Vite (using `rolldown-vite` variant)
- **Styling**: UnoCSS with Wind3 preset (Tailwind-like) and icon support
- **Language**: TypeScript with strict mode enabled
- **Audio Library**: `audio0` - provides ZAudio class and waveform generation
- **Metadata Parser**: `node-taglib-sharp-extend` - requires special Vite plugin configuration

## Architecture Overview

### State Management Pattern

The application uses a centralized context-based architecture:

1. **PlayerProvider** ([src/context/player.tsx](src/context/player.tsx)) - Root context provider that:
   - Creates and manages a single ZAudio instance for the entire app
   - Maintains reactive state using `createStore` from `solid-js/store`
   - Handles audio file loading via `createResource` (async resource pattern)
   - Sets up event listeners for audio events (play, pause, timeupdate, etc.)
   - Provides actions for playback control (play, pause, seek, setVolume)
   - Coordinates metadata parsing, lyric parsing, and waveform generation

2. **usePlayerContext hook** - Used by all components to access:
   - Player state (isPlaying, currentTime, duration, lyrics, metadata, etc.)
   - Player actions (play, pause, seek, setVolume, setAudioFile)

3. **Component structure**:
   - Components are presentation-focused and consume context
   - No local audio state - everything flows through PlayerProvider
   - App.tsx wraps everything in PlayerProvider and ErrorBoundary

### Audio File Loading Flow

When a user uploads an audio file:

1. `setAudioFile(file)` is called
2. `createResource` triggers, starting async loading
3. Parallel operations occur:
   - Metadata parsing via `parseMetadata()` (uses node-taglib-sharp-extend)
   - Lyric parsing if metadata contains lyrics
   - Waveform generation via `createWaveformGenerator()`
   - Audio track parsing via `parseTrack()` from audio0
4. ZAudio.load() is called with the parsed track
5. State updates trigger reactive UI updates

### Lyric System

The lyric parser ([src/utils/parse-lyric.ts](src/utils/parse-lyric.ts)) handles:
- Standard LRC format: `[mm:ss.xx]lyric text`
- Multiple timestamps per line (for repeated lyrics)
- Translation support (consecutive lines with same timestamp)
- Auto-scrolling synchronized with `currentTime` via timeupdate event

Active lyric tracking happens in the PlayerProvider timeupdate handler by comparing current time against lyric timestamps.

## Important Configuration Details

### Path Alias

The project uses `~` as an alias for `./src`:
```typescript
import { PlayerProvider } from '~/context/player'
```

This is configured in both `tsconfig.json` (paths) and `vite.config.ts` (resolve.alias).

### Vite Plugin Configuration

**Critical**: The `polyfillTaglib` plugin from `node-taglib-sharp-extend/vite` must be included in `vite.config.ts` for metadata parsing to work. It also requires special build configuration:

```typescript
plugins: [
  polyfillTaglib({ optimizeChunk: false }),
  uno({ inspector: false }),
  solid()
],
build: {
  rolldownOptions: {
    output: {
      advancedChunks: {
        groups: taglibAdvancedChunksConfig
      }
    }
  }
}
```

### UnoCSS Custom Configuration

- Custom icon extractor transforms `lucide:icon-name` to `i-lucide:icon-name` format
- Icons from `@iconify-json/lucide` are available via the Icon component
- Custom zoom rule: `zoom-50` → `zoom: 0.5`
- Scrollbars hidden globally via preflight CSS

## Testing

Tests use Bun's built-in test runner (Vitest-compatible API). Test files are colocated with source files (e.g., `parse-lyric.test.ts` next to `parse-lyric.ts`).

## Key Files to Understand

- [src/context/player.tsx](src/context/player.tsx) - Core audio logic and state management
- [src/types/player.ts](src/types/player.ts) - TypeScript interfaces for player state and actions
- [src/utils/parse-lyric.ts](src/utils/parse-lyric.ts) - LRC format parser
- [src/App.tsx](src/App.tsx) - Main UI layout and file upload handling
- [vite.config.ts](vite.config.ts) - Build configuration with taglib polyfill

## Common Patterns

### Adding New Player Features

When adding features that require audio state or control:

1. Add new state fields to `PlayerState` interface in [src/types/player.ts](src/types/player.ts)
2. Update `initialState` in [src/context/player.tsx](src/context/player.tsx)
3. Add actions to `PlayerActions` interface if needed
4. Implement action handlers in the `actions` object
5. Components access via `const [state, actions] = usePlayerContext()`

### Working with Audio Events

The ZAudio instance in PlayerProvider has event listeners. To add new audio event handling:

1. Use `audio.on('eventName', callback)` in PlayerProvider
2. Update state within the callback using `setState()`
3. Reactive components will automatically update

### Styling with UnoCSS

- Use Tailwind-like utility classes: `flex`, `items-center`, `bg-blue-500`, etc.
- Icons via Icon component: `<Icon name="lucide:play" />`
- Variant groups: use `hover:(bg-blue-500 text-white)` instead of `hover:bg-blue-500 hover:text-white`
