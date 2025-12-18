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

  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>()
  const lineRefs: HTMLDivElement[] = []

  // State
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = createSignal(true)
  const [resumeTimeout, setResumeTimeout] = createSignal<ReturnType<typeof setTimeout> | null>(null)

  // NOTE: isProgrammaticScroll is removed completely.

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

  // Update active states
  createEffect(
    on(
      () => state.activeLyricIndex,
      (activeIndex, prevIndex = 0) => {
        if (activeIndex !== prevIndex) {
          if (prevIndex >= 0 && prevIndex < lyricsStore.length) {
            setLyricsStore(prevIndex, 'isActive', false)
          }

          lyricsStore.forEach((_, index) => {
            setLyricsStore(index, 'isPast', index < activeIndex)
            setLyricsStore(index, 'isActive', index === activeIndex)
          })

          // Only scroll if allowed
          if (activeIndex >= 0 && isAutoScrollEnabled()) {
            scrollToActiveLyric(activeIndex)
          }
        }
        return activeIndex
      },
    ),
  )

  const handleLyricClick = (lyric: LyricLineData) => {
    if (lyric.time >= 0) {
      actions.seek(lyric.time)
    }
  }

  const hasValidLyrics = createMemo(() => lyricsStore.some((lyric) => lyric.time >= 0))

  // 1. HELPER: Schedules the auto-scroll to resume after 3 seconds
  const scheduleResume = () => {
    const current = resumeTimeout()
    if (current) {
      clearTimeout(current)
    }

    const id = setTimeout(() => {
      setIsAutoScrollEnabled(true)
      scrollToActiveLyric(state.activeLyricIndex)
    }, 3000)

    setResumeTimeout(id)
  }

  // 2. HANDLER: Specific User Interactions (The "Triggers")
  // These events ONLY happen when the user physically does something.
  // Programmatic scrollTo never triggers these.
  const handleUserInteraction = () => {
    setIsAutoScrollEnabled(false)
    scheduleResume()
  }

  // 3. HANDLER: The Scroll Event
  // We utilize this to keep the timer resetting if the user is
  // dragging the scrollbar or if momentum scrolling is happening.
  const handleScroll = () => {
    // If auto-scroll is ALREADY disabled, it means the user is in control.
    // We keep resetting the timer so we don't snap back while they are reading.
    if (!isAutoScrollEnabled()) {
      scheduleResume()
    }
    // If auto-scroll IS enabled, we ignore this event.
    // It's likely our own scrollTo causing it.
  }

  const scrollToActiveLyric = (activeIndex: number) => {
    const container = containerRef()
    if (!container || activeIndex < 0) {
      return
    }

    const activeLine = lineRefs[activeIndex]
    if (!activeLine) {
      return
    }

    const containerHeight = container.clientHeight
    const lineTop = activeLine.offsetTop
    const lineHeight = activeLine.clientHeight
    const targetPosition = containerHeight * 0.35
    const scrollTop = lineTop - targetPosition + lineHeight / 2

    container.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth',
    })
  }

  onCleanup(() => {
    const timeout = resumeTimeout()
    if (timeout) {
      clearTimeout(timeout)
    }
  })

  return (
    <div
      ref={setContainerRef}
      class="lyrics-display flex-1 overflow-y-auto max-h-[calc(100vh-4rem)]"
      // Attach handlers
      onScroll={handleScroll}
      onWheel={handleUserInteraction} // Detects Mouse Wheel / Trackpad
      onTouchStart={handleUserInteraction} // Detects Touch dragging
      onMouseDown={handleUserInteraction} // Detects Scrollbar clicks
      onKeyDown={handleUserInteraction} // Detects Arrow keys / Spacebar
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
