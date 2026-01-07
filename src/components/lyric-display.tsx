import { For, Show, createMemo, createSignal, createEffect, onCleanup, on } from 'solid-js'
import { usePlayerContext } from '~/context/player'
import type { LrcObj } from '~/utils/parse-lyric'
import { formatTime } from '~/utils/player-utils'

interface LyricLineProps {
  lyric: LrcObj
  index: number
  activeIndex: number
  isScrolling: boolean
  ref?: (el: HTMLDivElement) => void
  onClick?: () => void
}

function LyricLine(props: LyricLineProps) {
  const distance = createMemo(() => props.activeIndex - props.index)

  const blurAmount = createMemo(() => {
    const dis = Math.abs(distance())
    if (props.isScrolling || dis < 4) {
      return 0
    }
    const maxBlur = 4
    return Math.min(dis * 0.2, maxBlur)
  })

  return (
    <div
      ref={props.ref}
      onClick={props.onClick}
      data-active={distance() ? undefined : ''}
      data-past={distance() > 0 ? '' : undefined}
      class="lyric-line group relative py-1 text-center transition-all ease-out duration-300 cursor-pointer hover:opacity-90 text-(gray-500 2xl) opacity-60 data-[active]:(text-gray-200 opacity-100) data-[past]:(text-gray-400 opacity-70) hover:![filter:none]"
      style={{ filter: `blur(${blurAmount()}px)` }}
    >
      <div class="w-fit max-w-80% mx-auto rounded-xl p-(x-4 y-2) group-hover:bg-gray/10">
        <Show when={props.lyric.rawContent}>
          <div class="lyric-original mb-1 font-700">{props.lyric.rawContent}</div>
          <Show when={props.lyric.transContent}>
            <div class="lyric-translation font-500 opacity-50 text-lg">
              {props.lyric.transContent}
            </div>
          </Show>
        </Show>
      </div>

      {/* Pure CSS hover time display - only show for lyrics with valid time */}
      <Show when={props.lyric.time >= 0}>
        <div class="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none leading-none">
          {formatTime(props.lyric.time)}
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
  const [resumeTimeout, setResumeTimeout] = createSignal<ReturnType<typeof setTimeout>>()

  // Update active states - trigger auto-scroll when active lyric changes
  createEffect(
    on(
      () => state.activeLyricIndex,
      (activeIndex) => {
        // Only scroll if allowed
        if (activeIndex >= 0 && isAutoScrollEnabled()) {
          scrollToActiveLyric(activeIndex)
        }
      },
    ),
  )

  const handleLyricClick = (lyric: LrcObj) => {
    if (lyric.time >= 0) {
      actions.seek(lyric.time)
      scheduleResume(true)
    }
  }

  const hasValidLyrics = createMemo(() => state.lyrics.some((lyric) => lyric.time >= 0))

  // 1. HELPER: Schedules the auto-scroll to resume after 3 seconds
  const scheduleResume = (immediate?: boolean) => {
    const current = resumeTimeout()
    if (current) {
      clearTimeout(current)
    }

    if (immediate) {
      setIsAutoScrollEnabled(true)
      scrollToActiveLyric(state.activeLyricIndex)
      return
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
                <For each={state.lyrics}>
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
          <For each={state.lyrics}>
            {(lyric, index) => {
              const currentIndex = index()
              return (
                <LyricLine
                  lyric={lyric}
                  index={currentIndex}
                  activeIndex={state.activeLyricIndex}
                  isScrolling={!isAutoScrollEnabled()}
                  onClick={() => handleLyricClick(lyric)}
                  ref={(el) => {
                    lineRefs[currentIndex] = el
                  }}
                />
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}
