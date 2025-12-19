import { usePlayerContext } from '~/context/player'
import { Icon } from '~/components/icon'
import { formatTime } from '~/utils/player-utils'
import { createMemo } from 'solid-js'

export function AudioControls() {
  const [state, actions] = usePlayerContext()

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

  const handleSeek = (event: MouseEvent) => {
    const progressBar = event.currentTarget as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    const seekTime = percentage * state.duration
    actions.seek(seekTime)
  }

  const progressPercentage = createMemo(() =>
    state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0,
  )

  return (
    <div class="flex flex-col gap-4">
      {/* Time Display */}
      <div class="flex justify-between items-center text-sm text-white/70">
        <span>{formatTime(state.currentTime)}</span>
        <span>{formatTime(state.duration)}</span>
      </div>

      {/* Progress Bar */}
      <div class="w-full mb-4">
        <div
          class="relative w-full h-1 bg-white/30 rounded-full cursor-pointer hover:bg-white/40 transition-colors"
          onClick={handleSeek}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleSeek(e as any)
            }
          }}
          role="slider"
          tabIndex={0}
          aria-label="Seek progress"
          aria-valuemin={0}
          aria-valuemax={state.duration}
          aria-valuenow={state.currentTime}
        >
          {/* Progress fill */}
          <div
            class="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div class="flex items-center justify-center gap-8 children:bg-transparent">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          class="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white transition-colors"
          aria-label="Previous track"
        >
          <Icon name="lucide:skip-back" class="w-6 h-6" />
        </button>

        {/* Play/Pause Button */}
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
              state.isLoadingAudio
                ? 'lucide:loader-2'
                : state.isPlaying
                  ? 'lucide:pause'
                  : 'lucide:play'
            }
            class={`size-8 ${state.isLoadingAudio ? 'animate-spin' : ''}`}
          />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          class="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white transition-colors"
          aria-label="Next track"
        >
          <Icon name="lucide:skip-forward" class="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
