import { createSignal, createMemo, Show, ErrorBoundary } from 'solid-js'
import { PlayerProvider, usePlayerContext } from '~/context/PlayerProvider'
import { BackgroundLayer } from '~/components/BackgroundLayer'
import { AudioControls } from '~/components/AudioControls'
import { MetadataDisplay } from '~/components/MetadataDisplay'
import { LyricsDisplay } from '~/components/LyricsDisplay'
import { Icon } from '~/components/icon'

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

// Loading component
function LoadingSpinner() {
  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-white mb-4" />
      <p class="text-gray-300">Loading...</p>
    </div>
  )
}

// Main player interface component
function PlayerInterface(props: {
  onFileSelect: (file: File) => void
  onClearFile: () => void
  onDemoMode: () => void
  hasFile: boolean
}) {
  const [state] = usePlayerContext()
  let fileInputRef: HTMLInputElement

  // Show loading spinner if any resource is loading
  const isLoading = createMemo(() => state.isLoadingMetadata || state.isLoadingAudio)

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    console.log('File selected:', file)

    if (file && file.type.startsWith('audio/')) {
      console.log('Valid audio file, calling onFileSelect')
      props.onFileSelect(file)
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
    if (!props.hasFile) {
      fileInputRef?.click()
    }
  }

  const handleCoverKeyDown = (event: KeyboardEvent) => {
    if (!props.hasFile && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      fileInputRef?.click()
    }
  }

  const handleUploadClick = () => {
    fileInputRef?.click()
  }

  return (
    <>
      <Show when={!isLoading()} fallback={<LoadingSpinner />}>
        <div class="relative h-screen max-w-300 mx-a">
          {/* Background Layer */}
          <BackgroundLayer opacity={0.6} blurIntensity={20} />

          {/* Top Right Controls */}
          <div class="absolute top-4 right-4 z-20 flex gap-2">
            <button
              onClick={props.onDemoMode}
              class="p-3 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm rounded-full transition-all duration-200 text-white"
              title="Try demo mode"
            >
              <Icon name="lucide:play-circle" class="w-5 h-5" />
            </button>
            <button
              onClick={handleUploadClick}
              class="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 text-white"
              title="Upload audio file"
            >
              <Icon name="lucide:upload" class="w-5 h-5" />
            </button>
            <Show when={props.hasFile}>
              <button
                onClick={props.onClearFile}
                class="p-3 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-full transition-all duration-200 text-white"
                title="Clear current file"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
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
          <div class="relative z-10 flex min-h-screen p-8 gap-12">
            {/* Left Column - Album Cover, Metadata, and Controls */}
            <div class="flex flex-col gap-12 w-96 flex-shrink-0 justify-center">
              {/* Album Cover */}
              <div class="mb-6">
                <div
                  class={`aspect-square w-full bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm ${!props.hasFile ? 'cursor-pointer hover:bg-white/20 transition-all duration-200' : ''}`}
                  onClick={handleCoverClick}
                  onKeyDown={handleCoverKeyDown}
                  tabIndex={!props.hasFile ? 0 : -1}
                  role={!props.hasFile ? 'button' : undefined}
                  aria-label={!props.hasFile ? 'Click to upload audio file' : undefined}
                >
                  <Show
                    when={state.metadata?.artwork}
                    fallback={
                      <div class="text-center text-white/60">
                        <Icon name="lucide:music" class="w-16 h-16 mx-auto mb-2" />
                        <Show
                          when={props.hasFile}
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
                      class="w-full h-full object-cover rounded-2xl"
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
            <div class="flex-1 flex flex-col">
              <LyricsDisplay />
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}

export function App() {
  // Internal file state - remove debouncing as it's causing issues
  const [audioFile, setAudioFile] = createSignal<File | undefined>()

  const handleFileSelect = (file: File) => {
    console.log('handleFileSelect called with:', file)
    setAudioFile(file)
  }

  const handleClearFile = () => {
    setAudioFile(undefined)
  }

  const handleDemoMode = async () => {
    try {
      const demo = await fetch('./test.ogg').then((r) => r.arrayBuffer())
      const file = new File([demo], 'test.ogg', { type: 'audio/ogg' })

      setAudioFile(file)
    } catch (error) {
      console.error('Failed to create demo audio:', error)
      alert('Failed to create demo audio. Please try uploading your own file.')
    }
  }

  return (
    <div class="music-player-app">
      <ErrorBoundary fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}>
        <PlayerProvider audioFile={audioFile()} autoPlay={false}>
          <PlayerInterface
            onFileSelect={handleFileSelect}
            onClearFile={handleClearFile}
            onDemoMode={handleDemoMode}
            hasFile={!!audioFile()}
          />
        </PlayerProvider>
      </ErrorBoundary>
    </div>
  )
}
