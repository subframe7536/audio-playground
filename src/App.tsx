import { Show, ErrorBoundary } from 'solid-js'
import { PlayerProvider, usePlayerContext } from '~/context/player'
import { BackgroundLayer } from '~/components/background-layer'
import { AudioControls } from '~/components/audio-control'
import { MetadataDisplay } from '~/components/metadata-display'
import { LyricsDisplay } from '~/components/lyric-display'
import { Icon } from '~/components/icon'
import { IconButton } from '~/components/icon-button'
import url from '/test.ogg?url'

// Error fallback component
function ErrorFallback(props: { error: Error; reset: () => void }) {
  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div class="text-center max-w-md">
        <h2 class="text-2xl font-bold mb-4 text-red-400">Something went wrong</h2>
        <p class="text-gray-300 mb-6">{props.error.message}</p>
        <button
          onClick={props.reset}
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

// Main player interface component
function PlayerInterface() {
  const [state, { setAudioFile, hasFile }] = usePlayerContext()
  let fileInputRef: HTMLInputElement

  const handleClearFile = () => {
    setAudioFile(undefined)
  }

  const handleDemoMode = async () => {
    try {
      const demo = await fetch(url).then((r) => r.arrayBuffer())
      const file = new File([demo], 'test.ogg', { type: 'audio/ogg' })

      setAudioFile(file)
    } catch (error) {
      console.error('Failed to create demo audio:', error)
      alert('Failed to create demo audio. Please try uploading your own file.')
    }
  }

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    console.log('File selected:', file)

    if (file && file.type.startsWith('audio/')) {
      console.log('Valid audio file, calling onFileSelect')
      setAudioFile(file)
    } else if (file) {
      console.log('Invalid file type:', file.type)
      alert('Please select a valid audio file (MP3, M4A, WAV, etc.)')
    }

    // Reset input value to allow selecting the same file again
    if (target) {
      target.value = ''
    }
  }

  const handleCoverClick = () => {
    if (!hasFile()) {
      fileInputRef?.click()
    }
  }

  const handleCoverKeyDown = (event: KeyboardEvent) => {
    if (!hasFile() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      fileInputRef?.click()
    }
  }

  const handleUploadClick = () => {
    fileInputRef?.click()
  }

  return (
    <div class="relative h-screen max-w-300 mx-a">
      {/* Background Layer */}
      <BackgroundLayer opacity={0.7} blurIntensity={32} />

      {/* Top Right Controls */}
      <div class="absolute top-4 right-4 z-20 flex gap-2">
        <IconButton
          icon="lucide:circle-play"
          onClick={handleDemoMode}
          variant="primary"
          title="Try demo mode"
        />
        <IconButton
          icon="lucide:upload"
          onClick={handleUploadClick}
          variant="default"
          title="Upload audio file"
        />
        <Show when={hasFile()}>
          <IconButton
            icon="lucide:x"
            onClick={handleClearFile}
            variant="danger"
            title="Clear current file"
          />
        </Show>
      </div>

      {/* Hidden file input */}
      <input
        ref={(el) => (fileInputRef = el)}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        class="hidden"
      />

      {/* Main Content - Two Column Layout */}
      <div class="relative z-10 flex h-screen p-8 gap-6 md:gap-12 items-center justify-center">
        {/* Left Column - Album Cover, Metadata, and Controls */}
        <div class="flex-shrink-0 w-96 max-w-96">
          {/* Album Cover */}
          <div class="mb-6">
            <div
              class={`aspect-square w-full bg-white/10 rounded-2xl flex items-center justify-center relative ${!hasFile() ? 'cursor-pointer hover:bg-white/20 transition-all duration-200' : ''}`}
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
                          <span class="text-lg block mb-2">Click to upload</span>
                          <span class="text-sm opacity-75">Audio file</span>
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
            </div>
          </div>

          <div>
            <MetadataDisplay />
            <AudioControls />
          </div>
        </div>

        {/* Right Column - Lyrics */}
        <div class="flex-1 flex flex-col min-w-0">
          <LyricsDisplay />
        </div>
      </div>
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}>
      <PlayerProvider>
        <PlayerInterface />
      </PlayerProvider>
    </ErrorBoundary>
  )
}
