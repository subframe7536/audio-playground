import { createMemo, createSignal, For, Show } from 'solid-js'
import { usePlayerContext } from '~/context/player'
import { Icon } from './icon'
import { EditMetadataDialog } from './edit-metadata-dialog'

export function MetadataDisplay() {
  const [state] = usePlayerContext()
  const [isEditDialogOpen, setIsEditDialogOpen] = createSignal(false)

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
        <div class="space-y-1">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h1 class="text-xl font-bold text-white/90">{state.metadata?.title}</h1>
              <p class="text-lg text-white/60">
                {state.metadata?.artist} · {state.metadata?.album}
              </p>
            </div>
            <Show when={state.currentFile}>
              <button
                onClick={() => setIsEditDialogOpen(true)}
                class="p-2 rounded-lg bg-transparent line-height-none hover:bg-white/10 transition-colors shrink-0"
                aria-label="Edit metadata"
                title="Edit metadata"
              >
                <Icon name="lucide:pencil" class="size-5 text-white/60 hover:text-white" />
              </button>
            </Show>
          </div>
        </div>

        {/* Metadata line */}
        <Show when={buildMetadataLine().length > 0}>
          <div class="flex gap-2">
            <For each={buildMetadataLine()}>
              {(item) => <span class="rounded px-1 text-(gray-400 sm) b-(1 gray-400)">{item}</span>}
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
