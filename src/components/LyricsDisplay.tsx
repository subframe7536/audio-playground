import { For, Show, createMemo, createSignal, createEffect, onCleanup, on } from 'solid-js'
import { createStore } from 'solid-js/store'
import { usePlayerContext } from '~/context/PlayerProvider'
import type { LrcObj } from '~/utils/parse-lyric'
import { formatTime } from '~/utils/player-utils'

interface LyricLineData extends LrcObj {
  isActive: boolean
  isPast: boolean
}

interface LyricLineProps {
  lyricData: LyricLineData
  ref?: (el: HTMLDivElement) => void
  onClick?: () => void
}

function LyricLine(props: LyricLineProps) {
  return (
    // oxlint-disable-next-line click-events-have-key-events
    <div
      ref={props.ref}
      onClick={props.onClick}
      data-active={props.lyricData.isActive ? '' : undefined}
      data-past={props.lyricData.isPast ? '' : undefined}
      class="lyric-line group px-4 py-3 text-center transition-all ease-out duration-200 cursor-pointer hover:text-white/80 relative text-gray-500 text-lg opacity-60 data-[active]:(text-white text-2xl font-semibold opacity-100 scale-105) data-[past]:(text-gray-400 opacity-70)"
    >
      <Show when={props.lyricData.rawContent}>
        <div class="lyric-original mb-1">{props.lyricData.rawContent}</div>
      </Show>
      <Show when={props.lyricData.transContent}>
        <div class="lyric-translation text-sm opacity-80">{props.lyricData.transContent}</div>
      </Show>

      {/* Pure CSS hover time display - only show for lyrics with valid time */}
      <Show when={props.lyricData.time >= 0}>
        <div class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white/90 text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {formatTime(props.lyricData.time)}
        </div>
      </Show>
    </div>
  )
}

export function LyricsDisplay() {
  const [state, actions] = usePlayerContext()

  // Container and line element references
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>()
  const lineRefs: HTMLDivElement[] = []

  // Auto-scroll state management
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = createSignal(true)
  const [scrollTimeout, setScrollTimeout] = createSignal<ReturnType<typeof setTimeout> | null>(null)
  const [previousActiveIndex, setPreviousActiveIndex] = createSignal(-1)

  // Store for fine-grained reactivity - only updates individual lyric states
  const [lyricsStore, setLyricsStore] = createStore<LyricLineData[]>([])

  // Initialize and update lyrics store when lyrics change
  createEffect(() => {
    const lyrics = state.lyrics
    if (lyrics.length > 0) {
      setLyricsStore(
        lyrics.map((lyric) =>
          Object.assign({}, lyric, {
            isActive: false,
            isPast: false,
          }),
        ),
      )
    }
  })

  // Update active states in store when active index changes
  createEffect(
    on(
      () => state.activeLyricIndex,
      (activeIndex) => {
        const prevIndex = previousActiveIndex()

        // Only update if index actually changed
        if (activeIndex !== prevIndex) {
          // Reset previous active lyric
          if (prevIndex >= 0 && prevIndex < lyricsStore.length) {
            setLyricsStore(prevIndex, 'isActive', false)
          }

          // Update all lyrics' isPast state and set new active
          lyricsStore.forEach((_, index) => {
            setLyricsStore(index, 'isPast', index < activeIndex)
            setLyricsStore(index, 'isActive', index === activeIndex)
          })

          setPreviousActiveIndex(activeIndex)
        }
      },
    ),
  )

  // Separate effect for early scroll trigger based on current time
  createEffect(() => {
    const currentTime = state.currentTime
    const lyrics = lyricsStore

    if (lyrics.length === 0 || !isAutoScrollEnabled()) {
      return
    }

    // Find the next lyric that will become active in 250ms
    const anticipationTime = 0.25 // 250ms in seconds
    const targetTime = currentTime + anticipationTime

    // Find the lyric that should be scrolled to
    let targetIndex = -1
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time > currentTime && lyrics[i].time <= targetTime) {
        targetIndex = i
        break
      }
    }

    // If we found a target and it's different from what we last scrolled to
    const lastScrolledIndex = previousActiveIndex()
    console.log({ lastScrolledIndex, targetIndex })
    if (targetIndex >= 0 && targetIndex !== lastScrolledIndex) {
      scrollToActiveLyric(targetIndex)
    }
  })

  // Handle lyric click for seeking
  const handleLyricClick = (lyric: LyricLineData) => {
    if (lyric.time >= 0) {
      actions.seek(lyric.time)
    }
  }

  // Check if lyrics are available and valid
  const hasValidLyrics = createMemo(() => {
    return lyricsStore.some((lyric) => lyric.time >= 0)
  })

  // Handle manual scroll detection
  const handleScroll = () => {
    if (!isAutoScrollEnabled()) {
      return
    }

    // Disable auto-scroll temporarily
    setIsAutoScrollEnabled(false)

    // Clear existing timeout
    const currentTimeout = scrollTimeout()
    if (currentTimeout) {
      clearTimeout(currentTimeout)
    }

    // Set new timeout to re-enable auto-scroll after 3 seconds
    const newTimeout = setTimeout(() => {
      setIsAutoScrollEnabled(true)
    }, 3000)

    setScrollTimeout(newTimeout)
  }

  // Smooth scroll to position active lyric at 40% from top with slower animation
  const scrollToActiveLyric = (activeIndex: number) => {
    const container = containerRef()
    if (!container || !isAutoScrollEnabled() || activeIndex < 0) {
      return
    }

    const activeLine = lineRefs[activeIndex]
    if (!activeLine) {
      return
    }

    // Calculate scroll position to place active line at 40% from top
    const containerHeight = container.clientHeight
    const lineTop = activeLine.offsetTop
    const lineHeight = activeLine.clientHeight
    const targetPosition = containerHeight * 0.35 // 35% from top
    const scrollTop = lineTop - targetPosition + lineHeight / 2

    // Custom smooth scroll with slower animation
    const startScrollTop = container.scrollTop
    const distance = Math.max(0, scrollTop) - startScrollTop
    const duration = 800 // 800ms for slower animation
    const startTime = performance.now()

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic function for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)

      const currentScrollTop = startScrollTop + distance * easeOutCubic
      container.scrollTop = currentScrollTop

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }

    requestAnimationFrame(animateScroll)
  }

  // Cleanup timeout on unmount
  onCleanup(() => {
    const timeout = scrollTimeout()
    if (timeout) {
      clearTimeout(timeout)
    }
  })

  return (
    <div
      ref={setContainerRef}
      class="lyrics-display flex-1 overflow-y-auto max-h-[calc(100vh-4rem)]"
      onScroll={handleScroll}
    >
      <Show
        when={hasValidLyrics()}
        fallback={
          <div class="flex items-center justify-center h-full text-gray-400 text-lg">
            <Show when={state.lyrics.length > 0} fallback={<div>No lyrics available</div>}>
              <div class="text-center px-4">
                <div class="mb-4 text-gray-300">Lyrics (No timing information)</div>
                <For each={lyricsStore}>
                  {(lyric) => (
                    <div class="mb-2 text-gray-400">
                      <Show when={lyric.rawContent}>
                        <div class="mb-1">{lyric.rawContent}</div>
                      </Show>
                      <Show when={lyric.transContent}>
                        <div class="text-sm opacity-80">{lyric.transContent}</div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        }
      >
        <div class="lyrics-container py-16 px-4">
          <For each={lyricsStore}>
            {(lyricData, index) => (
              <LyricLine
                lyricData={lyricData}
                onClick={() => handleLyricClick(lyricData)}
                ref={(el) => {
                  lineRefs[index()] = el
                }}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
