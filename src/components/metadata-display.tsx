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
    const parts: { content: string; type: string }[] = []

    if (state.metadata?.year) {
      parts.push({
        content: state.metadata.year.toString(),
        type: 'year',
      })
    }

    if (state.metadata?.genres && state.metadata.genres.length > 0) {
      parts.push(
        ...state.metadata.genres
          .flatMap((s) => s.split(/\s?;\s?/g))
          .filter(Boolean)
          .map((g) => ({
            content: g,
            type: 'genre',
          })),
      )
    }

    if (state.metadata?.codecs && state.metadata.codecs.length > 0) {
      parts.push(
        ...state.metadata.codecs
          .map((s) => s.trim())
          .filter(Boolean)
          .map((c) => ({
            content: c,
            type: 'codec',
          })),
      )
    }

    return parts
  })

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
          <div class="flex gap-2 flex-wrap">
            <Show when={state.metadata?.quality}>
              {(quality) => (
                <span
                  class={qualityBg() + ' p-(x-2 y-1) rounded-md text-xs'}
                  title={`quality:${quality()}`}
                >
                  {quality()}
                </span>
              )}
            </Show>
            <For each={buildMetadataLine()}>
              {(item) => (
                <span
                  class="bg-white/20 text-gray-200 p-(x-2 y-1) rounded-md text-xs"
                  title={`${item.type}:${item.content}`}
                >
                  {item.content}
                </span>
              )}
            </For>
          </div>
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
