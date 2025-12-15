# Implementation Plan

- [ ] 1. Set up core services and interfaces
  - Create AudioService wrapper around audio0 ZAudio with playback controls
  - Create LyricsService that integrates with existing parseLyric utility
  - Create MetadataService wrapper around node-taglib-sharp-extend
  - Define TypeScript interfaces for PlayerState, AudioMetadata, and LyricState
  - _Requirements: 1.1, 3.2, 5.1_

- [ ]* 1.1 Write property test for lyric parsing and display
  - **Property 1: Lyric parsing and display**
  - **Validates: Requirements 1.1**

- [ ] 2. Implement BackgroundLayer component
  - Create BackgroundLayer component with blurred artwork background
  - Implement fallback gradient background for missing artwork
  - Add smooth transition animations between background changes
  - Ensure proper contrast overlay for text readability
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 2.1 Write property test for artwork background display
  - **Property 5: Artwork background display**
  - **Validates: Requirements 2.1**

- [ ]* 2.2 Write property test for background contrast maintenance
  - **Property 6: Background contrast maintenance**
  - **Validates: Requirements 2.3**

- [ ]* 2.3 Write property test for background transition smoothness
  - **Property 7: Background transition smoothness**
  - **Validates: Requirements 2.4**

- [ ] 3. Create AudioControls component with Lucide icons
  - Implement PlayButton component with play/pause state synchronization
  - Create ProgressBar component with seek functionality
  - Build TimeDisplay component for current time and duration
  - Add previous/next buttons using Lucide icons
  - Wire up all controls to AudioService actions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write property test for control button functionality
  - **Property 8: Control button functionality**
  - **Validates: Requirements 3.2**

- [ ]* 3.2 Write property test for play/pause icon synchronization
  - **Property 9: Play/pause icon synchronization**
  - **Validates: Requirements 3.3, 3.4**

- [ ]* 3.3 Write property test for progress bar seek functionality
  - **Property 10: Progress bar seek functionality**
  - **Validates: Requirements 3.5, 5.4**

- [ ] 4. Build LyricsDisplay component with synchronization
  - Create LyricLine component for individual lyric rendering
  - Implement lyric-time synchronization logic using createMemo
  - Add support for bilingual lyrics (original + translation)
  - Create placeholder display for missing lyrics
  - _Requirements: 1.2, 1.4, 1.5, 5.5_

- [ ]* 4.1 Write property test for lyric-time synchronization
  - **Property 2: Lyric-time synchronization**
  - **Validates: Requirements 1.2, 5.5**

- [ ]* 4.2 Write property test for bilingual lyric display
  - **Property 4: Bilingual lyric display**
  - **Validates: Requirements 1.4**

- [ ] 5. Implement Apple Music-style lyric animations
  - Create smooth scrolling to center active lyric lines
  - Implement sequential line-by-line upward movement animation
  - Add highlight animations with opacity and scale changes
  - Configure animation timing: 400ms line movement, 200ms highlighting, 150ms fading
  - Add staggered timing for sequential line animations
  - _Requirements: 1.3, 4.1, 4.2, 4.3, 4.4_

- [ ]* 5.1 Write property test for lyric scrolling behavior
  - **Property 3: Lyric scrolling behavior**
  - **Validates: Requirements 1.3**

- [ ]* 5.2 Write property test for Apple Music-style line animation
  - **Property 11: Apple Music-style line animation**
  - **Validates: Requirements 4.1**

- [ ]* 5.3 Write property test for animation timing consistency
  - **Property 12: Animation timing consistency**
  - **Validates: Requirements 4.2, 4.3, 4.4**

- [ ] 6. Add auto-scroll disable/enable functionality
  - Implement manual scroll detection in LyricsDisplay
  - Add temporary auto-scroll disable on user interaction
  - Create 3-second inactivity timer to re-enable auto-scroll
  - _Requirements: 4.5_

- [ ]* 6.1 Write property test for auto-scroll disable behavior
  - **Property 13: Auto-scroll disable behavior**
  - **Validates: Requirements 4.5**

- [ ] 7. Create MetadataDisplay component
  - Display track title, artist, and album information
  - Show total duration and current playback time
  - Update time display in real-time during playback
  - Handle missing metadata gracefully with fallback values
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 7.1 Write property test for metadata information display
  - **Property 14: Metadata information display**
  - **Validates: Requirements 5.1**

- [ ]* 7.2 Write property test for time information display
  - **Property 15: Time information display**
  - **Validates: Requirements 5.2, 5.3**

- [ ] 8. Integrate all components in MusicPlayerApp
  - Create main MusicPlayerApp component container
  - Set up reactive state management with createSignal and createStore
  - Wire up all component interactions and data flow
  - Implement error handling for audio loading, lyrics parsing, and metadata extraction
  - Add performance optimizations like memoized components and debounced updates
  - _Requirements: All requirements integration_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Update App.tsx to use MusicPlayerApp
  - Replace existing App component content with MusicPlayerApp
  - Add sample audio file and lyrics for demonstration
  - Test complete integration and user experience
  - _Requirements: Complete feature integration_

- [ ]* 10.1 Write integration tests for complete player functionality
  - Test end-to-end user workflows: file loading, playback control, lyric synchronization
  - Test error scenarios and edge cases
  - _Requirements: All requirements validation_

- [ ] 11. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.