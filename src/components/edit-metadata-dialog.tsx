import { createSignal, Show, For, createEffect, on, Switch, Match } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Icon } from './icon'
import { FormField } from './form-field'
import { Button } from './button'
import { TabButton } from './tab-button'
import {
  createFileFromBuffer,
  updateTag,
  updatePicture,
  flushFile,
  getBufferFromFile,
} from 'node-taglib-sharp-extend'
import { downloadFile } from '~/utils/download'
import { usePlayerContext } from '~/context/player'

interface EditMetadataDialogProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'metadata' | 'artwork' | 'lyric'

interface MetadataFormState {
  title: string
  artist: string
  album: string
  year: number | ''
  genres: string
  track: number | ''
  trackTotal: number | ''
  disk: number | ''
  diskTotal: number | ''
  albumArtists: string
  composers: string
  comment: string
  lyrics: string
}

interface FormFieldConfig {
  label: string
  key: keyof MetadataFormState
  type?: 'text' | 'number'
  placeholder?: string
}

export function EditMetadataDialog(props: EditMetadataDialogProps) {
  const { state } = usePlayerContext()
  const [activeTab, setActiveTab] = createSignal<TabType>('metadata')
  const [formState, setFormState] = createStore<MetadataFormState>({
    title: '',
    artist: '',
    album: '',
    year: '',
    genres: '',
    track: '',
    trackTotal: '',
    disk: '',
    diskTotal: '',
    albumArtists: '',
    composers: '',
    comment: '',
    lyrics: '',
  })
  const [newArtwork, setNewArtwork] = createSignal<File | null>(null)
  const [isProcessing, setIsProcessing] = createSignal(false)

  // Define form fields configuration
  const basicFields: FormFieldConfig[] = [
    { label: 'Title', key: 'title' },
    { label: 'Artist', key: 'artist' },
    { label: 'Album', key: 'album' },
  ]

  const gridFields: FormFieldConfig[][] = [
    [
      { label: 'Year', key: 'year', type: 'number' },
      { label: 'Genres (separated by ;)', key: 'genres' },
    ],
    [
      { label: 'Track', key: 'track', type: 'number' },
      { label: 'Track Total', key: 'trackTotal', type: 'number' },
    ],
    [
      { label: 'Disc', key: 'disk', type: 'number' },
      { label: 'Disc Total', key: 'diskTotal', type: 'number' },
    ],
    [
      { label: 'Album Artists (separated by ;)', key: 'albumArtists' },
      { label: 'Composers (separated by ;)', key: 'composers' },
    ],
  ]

  // Initialize form values when metadata changes
  createEffect(
    on(
      () => state.metadata,
      (meta) => {
        if (!meta) {
          return
        }
        setFormState({
          title: meta.title || '',
          artist: meta.artist || '',
          album: meta.album || '',
          year: meta.year || '',
          genres: meta.genres?.join(', ') || '',
          track: meta.track || '',
          trackTotal: meta.trackTotal || '',
          disk: meta.disk || '',
          diskTotal: meta.diskTotal || '',
          albumArtists: meta.albumArtists?.join(', ') || '',
          composers: meta.composers?.join(', ') || '',
          comment: '',
          lyrics: meta.lyrics || '',
        })
      },
      { defer: true },
    ),
  )

  const handleArtworkChange = (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files && input.files[0]) {
      setNewArtwork(input.files[0])
    }
  }

  const handleSave = async () => {
    if (!state.currentFile) {
      alert('No audio file loaded')
      return
    }

    setIsProcessing(true)

    try {
      // Read the original file as buffer
      const arrayBuffer = await state.currentFile.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      // Create taglib file from buffer
      let file = createFileFromBuffer(state.currentFile.name, buffer)

      // Update tags
      updateTag(file, 'title', formState.title)
      updateTag(
        file,
        'artists',
        formState.artist
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      )
      updateTag(file, 'album', formState.album)

      if (formState.year !== '') {
        updateTag(file, 'year', Number(formState.year))
      }

      if (formState.genres) {
        updateTag(
          file,
          'genres',
          formState.genres
            .split(/[,;]/)
            .map((g) => g.trim())
            .filter(Boolean),
        )
      }

      if (formState.track !== '') {
        updateTag(file, 'track', Number(formState.track))
      }

      if (formState.trackTotal !== '') {
        updateTag(file, 'trackTotal', Number(formState.trackTotal))
      }

      if (formState.disk !== '') {
        updateTag(file, 'disk', Number(formState.disk))
      }

      if (formState.diskTotal !== '') {
        updateTag(file, 'diskTotal', Number(formState.diskTotal))
      }

      if (formState.albumArtists) {
        updateTag(
          file,
          'albumArtists',
          formState.albumArtists
            .split(';')
            .map((a) => a.trim())
            .filter(Boolean),
        )
      }

      if (formState.composers) {
        updateTag(
          file,
          'composers',
          formState.composers
            .split(';')
            .map((c) => c.trim())
            .filter(Boolean),
        )
      }

      if (formState.comment) {
        updateTag(file, 'comment', formState.comment)
      }

      if (formState.lyrics) {
        updateTag(file, 'lyrics', formState.lyrics)
      }

      // Update artwork if new one is selected
      if (newArtwork()) {
        const artworkArrayBuffer = await newArtwork()!.arrayBuffer()
        const artworkBuffer = new Uint8Array(artworkArrayBuffer)
        updatePicture(file, artworkBuffer)
      }

      // Flush changes to the file
      file = flushFile(file)

      // Get the modified buffer
      const modifiedBuffer = getBufferFromFile(file)

      // Create a blob and download (ensure buffer is defined)
      const blob = new Blob([modifiedBuffer || new Uint8Array()], { type: state.currentFile.type })
      downloadFile(blob, state.currentFile.name.replace(/(\.[^.]+)$/, '_edited$1'))

      props.onClose()
    } catch (error) {
      console.error('Failed to save metadata:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Show when={props.isOpen}>
      {/* Backdrop */}
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={props.onClose}>
        {/* Dialog */}
        <div
          class="fixed left-50% top-50% z-50 translate--50% w-80% max-w-200 max-h-90vh"
          onClick={(e) => e.stopPropagation()}
        >
          <div class="overflow-hidden rounded-lg border border-gray-800 bg-gray-900 shadow-lg">
            {/* Header */}
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 class="text-lg font-semibold text-white">Edit Metadata</h2>
              <button
                onClick={props.onClose}
                class="rounded-sm text-gray-300 bg-transparent transition-color hover:text-gray-500 line-height-none"
                aria-label="Close"
              >
                <Icon name="lucide:x" class="size-5 text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div class="bg-gray-600 p-1 grid grid-cols-3 items-center justify-center rounded-lg mx-6 mt-4 gap-1">
              <TabButton
                isActive={activeTab() === 'metadata'}
                onClick={() => setActiveTab('metadata')}
              >
                Metadata
              </TabButton>
              <TabButton
                isActive={activeTab() === 'artwork'}
                onClick={() => setActiveTab('artwork')}
              >
                Artwork
              </TabButton>
              <TabButton isActive={activeTab() === 'lyric'} onClick={() => setActiveTab('lyric')}>
                Lyrics
              </TabButton>
            </div>

            {/* Content */}
            <div class="max-h-[calc(90vh-200px)] overflow-y-auto px-6 py-6">
              {/* Metadata Tab */}
              <Switch>
                <Match when={activeTab() === 'metadata'}>
                  <div class="space-y-4">
                    {/* Basic Fields */}
                    <For each={basicFields}>
                      {(field) => (
                        <FormField
                          label={field.label}
                          value={formState[field.key]}
                          onInput={(val) => setFormState(field.key, val)}
                          type={field.type}
                          placeholder={field.placeholder}
                        />
                      )}
                    </For>

                    {/* Grid Fields - 2 columns */}
                    <For each={gridFields}>
                      {(rowFields) => (
                        <div class="grid grid-cols-2 gap-4">
                          <For each={rowFields}>
                            {(field) => (
                              <FormField
                                label={field.label}
                                value={formState[field.key]}
                                onInput={(val) => setFormState(field.key, val)}
                                type={field.type}
                                placeholder={field.placeholder}
                              />
                            )}
                          </For>
                        </div>
                      )}
                    </For>

                    {/* Comment */}
                    <FormField
                      label="Comment"
                      value={formState.comment}
                      class="max-h-40"
                      onInput={(val) => setFormState('comment', String(val))}
                      rows={3}
                    />
                  </div>
                </Match>

                {/* Artwork Tab */}
                <Match when={activeTab() === 'artwork'}>
                  <div class="space-y-6">
                    {/* Current Artwork Preview */}
                    <Show when={state.metadata?.artwork}>
                      <div class="space-y-2">
                        <label class="text-sm font-medium leading-none text-gray-200">
                          Current Artwork
                        </label>
                        <div class="rounded-md border border-gray-800 overflow-hidden bg-gray-800/50 p-4">
                          <img
                            src={state.metadata!.artwork}
                            alt="Current album artwork"
                            class="w-full max-w-md mx-auto rounded-md"
                          />
                        </div>
                      </div>
                    </Show>

                    {/* New Artwork Upload */}
                    <div class="space-y-2">
                      <label class="text-sm font-medium leading-none text-gray-200">
                        Upload New Artwork
                      </label>
                      <div class="grid w-full items-center gap-1.5">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleArtworkChange}
                          class="flex w-full rounded-md border-(1 gray-700) bg-gray-800/50 p-(x-3 y-2) h-10 text-(sm gray-400) file:(border-0 bg-transparent text-sm font-medium text-white mr-4) placeholder:(text-gray-500) focus-visible:(outline-none ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900) disabled:(cursor-not-allowed opacity-50) cursor-pointer hover:(bg-gray-800/70) transition-colors"
                        />
                        <Show when={newArtwork()}>
                          <p class="text-sm text-gray-400">Selected: {newArtwork()!.name}</p>
                        </Show>
                      </div>
                    </div>
                  </div>
                </Match>

                {/* Lyrics Tab */}
                <Match when={activeTab() === 'lyric'}>
                  <div class="space-y-2">
                    <FormField
                      label="Lyrics (LRC format supported)"
                      value={formState.lyrics}
                      onInput={(val) => setFormState('lyrics', String(val))}
                      rows={15}
                      placeholder="Enter lyrics with LRC timestamps"
                    />
                    <p class="text-xs text-gray-400">
                      Tip: Use LRC format with timestamps for synchronized lyrics
                    </p>
                  </div>
                </Match>
              </Switch>
            </div>

            {/* Footer */}
            <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-800 bg-gray-900/50">
              <Button variant="secondary" onClick={props.onClose} disabled={isProcessing()}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isProcessing()}
                loading={isProcessing()}
              >
                {isProcessing() ? 'Processing...' : 'Save & Download'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
