import { Show, ErrorBoundary } from 'solid-js'
import { PlayerProvider, usePlayerContext } from '~/context/player'
import { BackgroundLayer } from '~/components/background-layer'
import { AlbumCover } from '~/components/album-cover'
import { AudioControls } from '~/components/audio-control'
import { MetadataDisplay } from '~/components/metadata-display'
import { LyricsDisplay } from '~/components/lyric-display'
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
  const { setAudioFile, hasFile } = usePlayerContext()
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

  const handleUploadClick = () => {
    fileInputRef?.click()
  }

  return (
    <div class="relative h-screen max-w-300 mx-a select-none">
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
      <div class="relative z-10 flex h-screen p-8 md:gap-8 lg:gap-16 items-center justify-center">
        {/* Left Column - Album Cover, Metadata, and Controls */}
        <div class="w-96 min-w-80">
          <AlbumCover onUploadClick={handleUploadClick} />
          <MetadataDisplay />
          <AudioControls />
        </div>

        {/* Right Column - Lyrics */}
        <div class="w-180 min-w-80 flex flex-col">
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
