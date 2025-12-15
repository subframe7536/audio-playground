# Synchronized Lyrics Music Player Design

## Overview

The Synchronized Lyrics Music Player is a SolidJS-based component that provides an immersive music listening experience with real-time synchronized lyrics, blurred album artwork backgrounds, and smooth Apple Music-style animations. The design leverages the existing `audio0` library for audio playback, `node-taglib-sharp-extend` for metadata extraction, and the custom `parse-lyric` utility for LRC format parsing.

## Architecture

The system follows a reactive component architecture using SolidJS patterns:

```
┌─────────────────────────────────────────┐
│           MusicPlayerApp                │
├─────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐│
│  │  AudioControls  │ │  LyricsDisplay  ││
│  │                 │ │                 ││
│  │ - PlayButton    │ │ - LyricLine[]   ││
│  │ - ProgressBar   │ │ - ScrollView    ││
│  │ - TimeDisplay   │ │ - Animations    ││
│  └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────┤
│           BackgroundLayer               │
│  - BlurredArtwork                       │
│  - GradientOverlay                      │
└─────────────────────────────────────────┘
```

### Core Services Layer

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  AudioService   │ │  LyricsService  │ │ MetadataService │
│                 │ │                 │ │                 │
│ - ZAudio        │ │ - parseLyric()  │ │ - parseMetadata │
│ - playback      │ │ - sync logic    │ │ - artwork       │
│ - time tracking │ │ - line matching │ │ - track info    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Components and Interfaces

### MusicPlayerApp Component

Main container component that orchestrates the entire player interface.

```typescript
interface MusicPlayerProps {
  audioFile?: File
  lyricsContent?: string
  autoPlay?: boolean
}

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  activeLyricIndex: number
  metadata: AudioMetadata | null
  artwork: string | null
}
```

### AudioControls Component

Handles playback controls and progress display.

```typescript
interface AudioControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
  onPrevious?: () => void
  onNext?: () => void
}
```

### LyricsDisplay Component

Manages synchronized lyrics rendering and animations.

```typescript
interface LyricsDisplayProps {
  lyrics: LrcObj[]
  currentTime: number
  activeLyricIndex: number
  onLyricClick?: (index: number) => void
}

interface LyricLineProps {
  lyric: LrcObj
  isActive: boolean
  isPast: boolean
  animationDelay: number
}
```

### BackgroundLayer Component

Handles blurred artwork background and visual effects.

```typescript
interface BackgroundLayerProps {
  artworkUrl: string | null
  opacity?: number
  blurIntensity?: number
}
```

## Data Models

### AudioMetadata

```typescript
interface AudioMetadata {
  title: string
  artist: string
  album: string
  duration: number
  artwork?: string
}
```

### LyricState

```typescript
interface LyricState {
  lyrics: LrcObj[]
  activeLyricIndex: number
  isAutoScrollEnabled: boolean
  userScrollTimeout: number | null
}
```

### AnimationState

```typescript
interface AnimationState {
  isAnimating: boolean
  direction: 'up' | 'down'
  staggerDelay: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, I need to analyze each acceptance criteria for testability:

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:
- Icon state properties (3.3, 3.4) → Combined into play/pause icon synchronization
- Animation timing properties (4.2, 4.3, 4.4) → Combined into comprehensive animation timing
- Time display properties (5.2, 5.3) → Combined into time information display
- Lyric synchronization properties (1.2, 5.5) → Combined into lyric-time synchronization

Property 1: Lyric parsing and display
*For any* valid LRC content, when audio playback begins, the parsed lyrics should be displayed in the lyrics component
**Validates: Requirements 1.1**

Property 2: Lyric-time synchronization
*For any* given playback time and set of timed lyrics, there should be exactly one active lyric line that corresponds to the current time, and seeking should immediately update the active line
**Validates: Requirements 1.2, 5.5**

Property 3: Lyric scrolling behavior
*For any* lyric line transition, the display should smoothly scroll to center the newly active line
**Validates: Requirements 1.3**

Property 4: Bilingual lyric display
*For any* lyrics containing translation content, both original and translated text should be rendered together
**Validates: Requirements 1.4**

Property 5: Artwork background display
*For any* available album artwork, it should be displayed as a blurred background covering the interface
**Validates: Requirements 2.1**

Property 6: Background contrast maintenance
*For any* background (artwork or default), sufficient contrast should be maintained for text readability
**Validates: Requirements 2.3**

Property 7: Background transition smoothness
*For any* artwork change, the background should transition smoothly to the new image
**Validates: Requirements 2.4**

Property 8: Control button functionality
*For any* playback control button click, the corresponding audio engine action should be triggered
**Validates: Requirements 3.2**

Property 9: Play/pause icon synchronization
*For any* audio playback state (playing or paused), the control button should display the appropriate icon (pause when playing, play when paused)
**Validates: Requirements 3.3, 3.4**

Property 10: Progress bar seek functionality
*For any* progress bar click position, the audio should seek to the corresponding time position and update the progress bar immediately
**Validates: Requirements 3.5, 5.4**

Property 11: Apple Music-style line animation
*For any* active lyric line change, all visible lines should animate moving up sequentially without per-word transformations
**Validates: Requirements 4.1**

Property 12: Animation timing consistency
*For any* lyric animation (line movement, highlighting, fading), the timing should follow specified durations: 400ms for line movement with stagger, 200ms for highlighting, 150ms for fading
**Validates: Requirements 4.2, 4.3, 4.4**

Property 13: Auto-scroll disable behavior
*For any* manual user scroll action, auto-scroll should be temporarily disabled and automatically re-enabled after 3 seconds of inactivity
**Validates: Requirements 4.5**

Property 14: Metadata information display
*For any* available audio metadata, track title, artist, and album information should be displayed in the interface
**Validates: Requirements 5.1**

Property 15: Time information display
*For any* loaded audio file, total duration and current playback time should be displayed and updated in real-time during playback
**Validates: Requirements 5.2, 5.3**

## Error Handling

### Audio Loading Errors
- Graceful fallback when audio files cannot be loaded
- User feedback for unsupported audio formats
- Retry mechanisms for network-related audio loading failures

### Lyrics Parsing Errors
- Fallback to plain text display when LRC parsing fails
- Handling of malformed timestamp formats
- Support for lyrics without timestamps

### Metadata Extraction Errors
- Default values when metadata extraction fails
- Graceful handling of missing artwork
- Fallback artist/title information

### Animation Performance
- Frame rate monitoring and animation degradation
- Reduced motion support for accessibility
- Memory cleanup for animation resources

## Testing Strategy

### Unit Testing Approach
Unit tests will focus on:
- Individual component rendering with specific props
- Event handler functionality and state updates
- Edge cases like empty lyrics, missing metadata, and invalid audio files
- Integration between audio service and UI components

### Property-Based Testing Approach
Property-based tests will verify universal behaviors using **Vitest** with custom generators:
- Lyric synchronization across random time values and lyric sets
- Animation timing consistency across different transition scenarios
- Background contrast maintenance across various artwork inputs
- Control state synchronization across different audio states

Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage. Tests will be tagged with comments explicitly referencing the correctness property from this design document using the format: **Feature: synchronized-lyrics-player, Property {number}: {property_text}**

### Test Data Generation
- Random LRC content with various timestamp formats
- Mock audio files with different metadata configurations
- Simulated user interactions and timing scenarios
- Edge cases including empty states and error conditions

## Implementation Architecture

### State Management
Using SolidJS reactive primitives:
- `createSignal()` for simple state like current time, play state
- `createStore()` for complex objects like lyrics array, metadata
- `createMemo()` for derived values like active lyric index
- `createEffect()` for side effects like audio time updates

### Component Hierarchy
```
MusicPlayerApp
├── BackgroundLayer
├── AudioControls
│   ├── PlayButton
│   ├── ProgressBar
│   └── TimeDisplay
├── MetadataDisplay
└── LyricsDisplay
    └── LyricLine (multiple)
```

### Service Integration
- AudioService: Wraps `audio0` ZAudio for playback control
- LyricsService: Uses existing `parseLyric` utility for LRC processing
- MetadataService: Integrates `node-taglib-sharp-extend` for file analysis
- AnimationService: Manages CSS transitions and timing coordination

### Performance Considerations
- Virtual scrolling for large lyric sets
- Debounced time updates to prevent excessive re-renders
- Memoized lyric line components to minimize DOM updates
- Lazy loading of artwork and metadata