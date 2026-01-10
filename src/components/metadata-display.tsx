import { createMemo, createSignal, For, Show } from 'solid-js'
import { usePlayerContext } from '~/context/player'
import { Icon } from './icon'
import { EditMetadataDialog } from './edit-metadata-dialog'
import { IconButton } from './icon-button'

export function MetadataDisplay() {
  const [state] = usePlayerContext()
  const [isEditDialogOpen, setIsEditDialogOpen] = createSignal(false)
  const qualityBg = createMemo(() => {
    switch (state.metadata?.quality) {
      case 'HQ':
        return 'bg-green-200/30'
      case 'Hi-Res':
        return 'bg-yellow-400/30'
      case 'SQ':
        return 'bg-blue-300/30'
      default:
        return 'bg-white/20'
    }
  })

  const buildMetadataLine = createMemo(() => {
    const parts = []

    if (state.metadata?.year) {
      parts.push(state.metadata.year.toString())
    }

    if (state.metadata?.genres && state.metadata.genres.length > 0) {
      parts.push(...state.metadata.genres)
    }

    return parts
  })

  const buildAudioInfo = () => {
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
  }

  return (
    <>
      <div class="text-white space-y-4 mb-4">
        {/* Title and Artist with Edit Button */}
        <Show when={state.metadata}>
          <div class="flex items-start justify-between gap-2">
            <div>
              <h1 class="text-2xl mb-4 font-bold text-white/90">{state.metadata?.title}</h1>
              <div class="text-(sm white/60) flex gap-1 items-center mb-2">
                <Icon name="lucide:user" />
                {state.metadata?.artist}
              </div>
              <div class="text-(sm white/60) flex gap-1 items-center align-end">
                <Icon name="lucide:disc" />
                {state.metadata?.album}
              </div>
            </div>
            <Show when={state.currentFile}>
              <IconButton
                icon="lucide:ellipsis"
                variant="plain"
                onClick={() => setIsEditDialogOpen(true)}
                title="Edit metadata"
              />
            </Show>
          </div>
        </Show>

        {/* Metadata line */}
        <Show when={buildMetadataLine().length > 0}>
          <div class="flex gap-2">
            <Show when={state.metadata}>
              <span class={qualityBg() + ' p-(x-2 y-1) rounded-md text-xs'}>
                {state.metadata?.quality}
              </span>
            </Show>
            <For each={buildMetadataLine()}>
              {(item) => (
                <span class="bg-white/20 text-gray-200 p-(x-2 y-1) rounded-md text-xs">{item}</span>
              )}
            </For>
          </div>
        </Show>

        {/* Audio info */}
        <Show when={buildAudioInfo()}>
          {(audioInfo) => <p class="text-(gray-400 sm)">{audioInfo()}</p>}
        </Show>
      </div>

      {/* Edit Dialog */}
      <EditMetadataDialog
        isOpen={isEditDialogOpen()}
        onClose={() => setIsEditDialogOpen(false)}
        metadata={state.metadata}
        originalFile={state.currentFile || undefined}
      />
    </>
  )
}
