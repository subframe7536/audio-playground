import { usePlayerContext } from '~/context/player'
import { Icon } from '~/components/icon'
import { formatTime } from '~/utils/player-utils'
import { createMemo, Index, Show, createSignal } from 'solid-js'
import { IconButton } from './icon-button'
import { clamp } from 'audio0'

export function AudioControls() {
  const [state, actions] = usePlayerContext()
  let lastVolume = 0
  // oxlint-disable-next-line no-unassigned-vars
  let seekBarRef: HTMLDivElement | undefined
  // oxlint-disable-next-line no-unassigned-vars
  let volumeBarRef: HTMLDivElement | undefined

  // Drag state for debouncing
  const [previewTime, setPreviewTime] = createSignal(0)

  const handlePlayPause = async () => {
    if (state.isPlaying) {
      actions.pause()
    } else {
      try {
        await actions.play()
      } catch (error) {
        console.error('Failed to play audio:', error)
        // Could show user-friendly error message here
      }
    }
  }

  const handlePrevious = () => {
    // TODO: Implement previous track functionality
    console.log('Previous track')
  }

  const handleNext = () => {
    // TODO: Implement next track functionality
    console.log('Next track')
  }

  // Generic handler for calculating percentage from pointer position
  const calculatePercentage = (element: HTMLElement, clientX: number) => {
    const rect = element.getBoundingClientRect()
    const x = clientX - rect.left
    return clamp(0, x / rect.width, 1)
  }

  // Seek slider handlers with debounce
  const handleSeekPointerDown = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
    if (seekBarRef) {
      const percentage = calculatePercentage(seekBarRef, event.clientX)
      setPreviewTime(percentage * state.duration)
    }
  }

  const handleSeekPointerMove = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement
    if (!target.hasPointerCapture(event.pointerId) || !seekBarRef) {
      return
    }

    event.preventDefault()
    const percentage = calculatePercentage(seekBarRef, event.clientX)
    setPreviewTime(percentage * state.duration)
  }

  const handleSeekPointerUp = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement
    if (!target.hasPointerCapture(event.pointerId) || !seekBarRef) {
      return
    }
    actions.seek(previewTime())
  }

  // Volume slider handlers with transition disable
  const handleVolumePointerDown = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)

    if (volumeBarRef) {
      const percentage = calculatePercentage(volumeBarRef, event.clientX)
      actions.setVolume(percentage)
    }
  }

  const handleVolumePointerMove = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement
    if (!target.hasPointerCapture(event.pointerId) || !volumeBarRef) {
      return
    }

    event.preventDefault()
    const percentage = calculatePercentage(volumeBarRef, event.clientX)
    actions.setVolume(percentage)
  }

  const handleVolumePointerUp = () => {}

  // Calculate display time (preview during drag, actual time otherwise)
  const displayTime = createMemo(() => previewTime() ?? state.currentTime)

  // Calculate display percentage for progress bar
  const displayPercent = createMemo(() => {
    if (state.duration === 0) {
      return 0
    }
    return (displayTime() / state.duration) * 100
  })

  const volumeIcon = createMemo(() => {
    if (state.volume === 0) {
      return 'lucide:volume-off'
    }
    return state.volume < 0.5 ? 'lucide:volume-1' : 'lucide:volume-2'
  })

  const buildAudioInfo = createMemo(() => {
    const parts = []

    if (state.metadata?.bitDepth) {
      parts.push(`${state.metadata.bitDepth}-bit`)
    }

    if (state.metadata?.sampleRate) {
      const khz = state.metadata.sampleRate / 1000
      parts.push(`${khz}kHz`)
    }

    if (state.metadata?.bitRate) {
      parts.push(`${state.metadata.bitRate}kbps`)
    }

    if (state.metadata?.channels) {
      const channelText =
        state.metadata.channels === 1
          ? 'Mono'
          : state.metadata.channels === 2
            ? 'Stereo'
            : `${state.metadata.channels}ch`
      parts.push(channelText)
    }

    return parts.length > 0 ? parts.join(' / ') : null
  })

  return (
    <>
      {/* Progress Bar */}
      <div class="w-full mt-8 group">
        <div
          ref={seekBarRef}
          class={`relative w-full ${state.waveform ? 'h-12' : 'h-1 group-hover:h-2'} cursor-pointer transition-all duration-300 touch-none`}
          style={{
            '--percent': `${displayPercent()}%`,
          }}
          onPointerDown={handleSeekPointerDown}
          onPointerMove={handleSeekPointerMove}
          onPointerUp={handleSeekPointerUp}
          role="slider"
          tabIndex={0}
          aria-label="Seek progress"
        >
          {/* Waveform Visualization */}
          <Show
            when={state.waveform}
            fallback={
              <div class={`absolute top-0 left-0 h-full bg-white rounded-full w-$percent`} />
            }
          >
            <div
              class="absolute inset-0 flex items-center justify-between gap-1 pointer-events-none children:(flex-1 bg-white rounded-full origin-center transition-(all delay-100) duration-500 ease-out h-$hgt)"
              style={{
                '-webkit-mask-image': `linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) var(--percent), rgba(0,0,0,0.4) var(--percent), rgba(0,0,0,0.4) 100%)`,
                'mask-image': `linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) var(--percent), rgba(0,0,0,0.4) var(--percent), rgba(0,0,0,0.4) 100%)`,
              }}
            >
              <Index each={state.waveform}>
                {(amp) => (
                  <div
                    style={{
                      '--hgt': `${amp() * 100}%`,
                    }}
                  />
                )}
              </Index>
            </div>
          </Show>
        </div>
      </div>

      {/* Time Display */}
      <div class="flex justify-between text-sm text-white/70 py-2 relative">
        <span>{formatTime(displayTime())}</span>
        <Show when={buildAudioInfo()}>
          {(audioInfo) => (
            <span class="text-(xs white/30) absolute left-50% top-55% translate--50% whitespace-nowrap">
              {audioInfo()}
            </span>
          )}
        </Show>
        <span>{formatTime(state.duration)}</span>
      </div>

      {/* Control Buttons and Volume - Optimized Layout */}
      <div class="flex mt-6 items-center justify-around gap-4 children:bg-transparent w-60% mx-auto">
        {/* Left: Previous Button */}
        <button
          onClick={handlePrevious}
          class="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white transition-colors"
          aria-label="Previous track"
        >
          <Icon name="lucide:skip-back" class="w-6 h-6" />
        </button>

        {/* Center: Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          disabled={!state.isAudioReady}
          class={`flex items-center justify-center w-10 h-10 text-white transition-colors ${
            state.isAudioReady
              ? 'hover:text-white/80 cursor-pointer'
              : 'cursor-not-allowed opacity-50'
          }`}
          aria-label={state.isPlaying ? 'Pause' : 'Play'}
        >
          <Icon
            name={
              state.isLoading ? 'lucide:loader-2' : state.isPlaying ? 'lucide:pause' : 'lucide:play'
            }
            class={`size-8 ${state.isLoading ? 'animate-spin' : ''}`}
          />
        </button>

        {/* Right: Next Button */}
        <button
          onClick={handleNext}
          class="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white transition-colors"
          aria-label="Next track"
        >
          <Icon name="lucide:skip-forward" class="w-6 h-6" />
        </button>
      </div>

      {/* Volume Control */}
      <div class="flex items-center gap-3 mt-6">
        <IconButton
          icon={volumeIcon()}
          variant="plain"
          onClick={() => {
            if (lastVolume === 0) {
              lastVolume = state.volume
              actions.setVolume(0)
            } else {
              actions.setVolume(lastVolume)
              lastVolume = 0
            }
          }}
        />
        <div class="flex-1 group py-2">
          <div
            ref={volumeBarRef}
            class="relative w-full h-1 bg-white/20 rounded-full cursor-pointer group-hover:h-2 transition-height duration-200 touch-none"
            style={{
              '--volume-percent': `${state.volume * 100}%`,
            }}
            onPointerDown={handleVolumePointerDown}
            onPointerMove={handleVolumePointerMove}
            onPointerUp={handleVolumePointerUp}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                actions.setVolume(Math.max(0, state.volume - 0.05))
              } else if (e.key === 'ArrowRight') {
                actions.setVolume(Math.min(1, state.volume + 0.05))
              }
            }}
            role="slider"
            tabIndex={0}
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(state.volume * 100)}
          >
            <div class={`absolute top-0 left-0 h-full bg-white rounded-full w-$volume-percent`} />
          </div>
        </div>
        <span class="text-xs text-white/50 w-8 text-right">{Math.round(state.volume * 100)}</span>
      </div>
    </>
  )
}
