import { createSignal, Show, onMount, For } from 'solid-js'
import { Icon } from './icon'
import { FormField } from './form-field'
import { Button } from './button'
import { TabButton } from './tab-button'
import type { AudioMetadata } from '~/types/player'
import {
  createFileFromBuffer,
  updateTag,
  updatePicture,
  flushFile,
  getBufferFromFile,
} from 'node-taglib-sharp-extend'
import { downloadFile } from '~/utils/download'

interface EditMetadataDialogProps {
  isOpen: boolean
  onClose: () => void
  metadata: AudioMetadata | null
  originalFile: File | undefined
}

type TabType = 'metadata' | 'artwork' | 'lyric'

interface FormFieldConfig {
  label: string
  value: () => string | number | ''
  setValue: (val: string | number | '') => void
  type?: 'text' | 'number'
  placeholder?: string
}

export function EditMetadataDialog(props: EditMetadataDialogProps) {
  const [activeTab, setActiveTab] = createSignal<TabType>('metadata')
  const [title, setTitle] = createSignal('')
  const [artist, setArtist] = createSignal('')
  const [album, setAlbum] = createSignal('')
  const [year, setYear] = createSignal<number | ''>('')
  const [genres, setGenres] = createSignal<string>('')
  const [track, setTrack] = createSignal<number | ''>('')
  const [trackTotal, setTrackTotal] = createSignal<number | ''>('')
  const [disk, setDisk] = createSignal<number | ''>('')
  const [diskTotal, setDiskTotal] = createSignal<number | ''>('')
  const [albumArtists, setAlbumArtists] = createSignal<string>('')
  const [composers, setComposers] = createSignal<string>('')
  const [comment, setComment] = createSignal('')
  const [lyrics, setLyrics] = createSignal('')
  const [newArtwork, setNewArtwork] = createSignal<File | null>(null)
  const [isProcessing, setIsProcessing] = createSignal(false)

  // Define form fields configuration
  const basicFields: FormFieldConfig[] = [
    { label: 'Title', value: title, setValue: setTitle },
    { label: 'Artist', value: artist, setValue: setArtist },
    { label: 'Album', value: album, setValue: setAlbum },
  ]

  const gridFields: FormFieldConfig[][] = [
    [
      { label: 'Year', value: year, setValue: setYear, type: 'number' },
      { label: 'Genres (separated by ;)', value: genres, setValue: setGenres },
    ],
    [
      { label: 'Track', value: track, setValue: setTrack, type: 'number' },
      { label: 'Track Total', value: trackTotal, setValue: setTrackTotal, type: 'number' },
    ],
    [
      { label: 'Disc', value: disk, setValue: setDisk, type: 'number' },
      { label: 'Disc Total', value: diskTotal, setValue: setDiskTotal, type: 'number' },
    ],
    [
      { label: 'Album Artists (separated by ;)', value: albumArtists, setValue: setAlbumArtists },
      { label: 'Composers (separated by ;)', value: composers, setValue: setComposers },
    ],
  ]

  // Initialize form values when metadata changes
  onMount(() => {
    if (props.metadata) {
      setTitle(props.metadata.title || '')
      setArtist(props.metadata.artist || '')
      setAlbum(props.metadata.album || '')
      setYear(props.metadata.year || '')
      setGenres(props.metadata.genres?.join(', ') || '')
      setTrack(props.metadata.track || '')
      setTrackTotal(props.metadata.trackTotal || '')
      setDisk(props.metadata.disk || '')
      setDiskTotal(props.metadata.diskTotal || '')
      setAlbumArtists(props.metadata.albumArtists?.join(', ') || '')
      setComposers(props.metadata.composers?.join(', ') || '')
      setComment('')
      setLyrics(props.metadata.lyrics || '')
    }
  })

  const handleArtworkChange = (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files && input.files[0]) {
      setNewArtwork(input.files[0])
    }
  }

  const handleSave = async () => {
    if (!props.originalFile) {
      alert('No audio file loaded')
      return
    }

    setIsProcessing(true)

    try {
      // Read the original file as buffer
      const arrayBuffer = await props.originalFile.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      // Create taglib file from buffer
      let file = createFileFromBuffer(props.originalFile.name, buffer)

      // Update tags
      updateTag(file, 'title', title())
      updateTag(
        file,
        'artists',
        artist()
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      )
      updateTag(file, 'album', album())

      if (year() !== '') {
        updateTag(file, 'year', Number(year()))
      }

      if (genres()) {
        updateTag(
          file,
          'genres',
          genres()
            .split(/[,;]/)
            .map((g) => g.trim())
            .filter(Boolean),
        )
      }

      if (track() !== '') {
        updateTag(file, 'track', Number(track()))
      }

      if (trackTotal() !== '') {
        updateTag(file, 'trackTotal', Number(trackTotal()))
      }

      if (disk() !== '') {
        updateTag(file, 'disk', Number(disk()))
      }

      if (diskTotal() !== '') {
        updateTag(file, 'diskTotal', Number(diskTotal()))
      }

      if (albumArtists()) {
        updateTag(
          file,
          'albumArtists',
          albumArtists()
            .split(';')
            .map((a) => a.trim())
            .filter(Boolean),
        )
      }

      if (composers()) {
        updateTag(
          file,
          'composers',
          composers()
            .split(';')
            .map((c) => c.trim())
            .filter(Boolean),
        )
      }

      if (comment()) {
        updateTag(file, 'comment', comment())
      }

      if (lyrics()) {
        updateTag(file, 'lyrics', lyrics())
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
      const blob = new Blob([modifiedBuffer || new Uint8Array()], { type: props.originalFile.type })
      downloadFile(blob, props.originalFile.name.replace(/(\.[^.]+)$/, '_edited$1'))

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
      <div
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        onClick={props.onClose}
      >
        {/* Dialog */}
        <div
          class="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl max-h-[90vh]"
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
              <Show when={activeTab() === 'metadata'}>
                <div class="space-y-4">
                  {/* Basic Fields */}
                  <For each={basicFields}>
                    {(field) => (
                      <FormField
                        label={field.label}
                        value={field.value()}
                        onInput={field.setValue}
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
                              value={field.value()}
                              onInput={field.setValue}
                              type={field.type}
                              placeholder={field.placeholder}
                            />
                          )}
                        </For>
                      </div>
                    )}
                  </For>

                  {/* Comment */}
                  <FormField label="Comment" value={comment()} onInput={setComment} rows={3} />
                </div>
              </Show>

              {/* Artwork Tab */}
              <Show when={activeTab() === 'artwork'}>
                <div class="space-y-6">
                  {/* Current Artwork Preview */}
                  <Show when={props.metadata?.artwork}>
                    <div class="space-y-2">
                      <label class="text-sm font-medium leading-none text-gray-200">
                        Current Artwork
                      </label>
                      <div class="rounded-md border border-gray-800 overflow-hidden bg-gray-800/50 p-4">
                        <img
                          src={props.metadata!.artwork}
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
              </Show>

              {/* Lyrics Tab */}
              <Show when={activeTab() === 'lyric'}>
                <div class="space-y-2">
                  <FormField
                    label="Lyrics (LRC format supported)"
                    value={lyrics()}
                    onInput={setLyrics}
                    rows={15}
                    placeholder="Enter lyrics with LRC timestamps"
                  />
                  <p class="text-xs text-gray-400">
                    Tip: Use LRC format with timestamps for synchronized lyrics
                  </p>
                </div>
              </Show>
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
