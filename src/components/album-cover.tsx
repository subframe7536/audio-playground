import { Show } from 'solid-js'
import type { ComponentProps } from 'solid-js'
import { Icon } from '~/components/icon'
import { usePlayerContext } from '~/context/player'

function Square(props: ComponentProps<'div'>) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        'padding-bottom': '100%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
        {...props}
      />
    </div>
  )
}

interface AlbumCoverProps {
  onUploadClick: () => void
}

export function AlbumCover(props: AlbumCoverProps) {
  const { state, hasFile } = usePlayerContext()

  const handleCoverClick = () => {
    if (!hasFile()) {
      props.onUploadClick()
    }
  }

  const handleCoverKeyDown = (event: KeyboardEvent) => {
    if (!hasFile() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      props.onUploadClick()
    }
  }

  return (
    <Square
      class={`mb-6 bg-white/10 rounded-2xl flex items-center justify-center relative ${
        !hasFile() ? 'cursor-pointer hover:bg-white/20 transition-all duration-200' : ''
      }`}
      onClick={handleCoverClick}
      onKeyDown={handleCoverKeyDown}
      tabIndex={!hasFile() ? 0 : -1}
      role={!hasFile() ? 'button' : undefined}
      aria-label={!hasFile() ? 'Click to upload audio file' : undefined}
    >
      {/* Loading Spinner Overlay */}
      <Show when={state.isLoading}>
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
          <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-white mb-4" />
          <p class="text-gray-300">Loading...</p>
        </div>
      </Show>

      <Show
        when={state.metadata?.artwork}
        fallback={
          <div class="text-center text-white/60">
            <Icon name="lucide:music" class="w-16 h-16 mx-auto mb-2" />
            <Show
              when={hasFile()}
              fallback={
                <div>
                  <span class="text-lg block mb-4">Click to upload audio file</span>
                  <span class="opacity-60">Or click play button on the top right</span>
                  <br />
                  <span class="opacity-60">to load demo file</span>
                </div>
              }
            >
              <span class="text-lg">No Cover</span>
            </Show>
          </div>
        }
      >
        <img
          src={state.metadata?.artwork}
          alt="Album artwork"
          class="size-full object-cover rounded-2xl"
        />
      </Show>
    </Square>
  )
}
