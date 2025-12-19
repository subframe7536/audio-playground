import { createMemo } from 'solid-js'
import { usePlayerContext } from '~/context/player'

export interface BackgroundLayerProps {
  opacity?: number
  blurIntensity?: number
}

export function BackgroundLayer(props: BackgroundLayerProps) {
  const [state] = usePlayerContext()

  const opacity = () => props.opacity ?? 0.9
  const blurIntensity = () => props.blurIntensity ?? 32

  // Create memoized background style
  const backgroundStyle = createMemo(() => {
    if (state.artwork) {
      return {
        'background-image': `url(${state.artwork})`,
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
      }
    }
    return {}
  })

  // Create memoized blur filter
  const blurFilter = createMemo(() => `blur(${blurIntensity()}px)`)

  return (
    <div class="fixed inset-0 -z-10 overflow-hidden">
      {/* Artwork background with blur */}
      <div
        class="absolute inset-0 transition-all duration-1000 ease-in-out transform scale-110"
        style={{
          ...backgroundStyle(),
          filter: blurFilter(),
          opacity: state.artwork ? 1 : 0,
        }}
      />

      {/* Fallback gradient background */}
      <div
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: state.artwork ? 0 : 1,
        }}
      />

      {/* Contrast overlay for text readability */}
      <div
        class="absolute inset-0 bg-black transition-opacity duration-500 ease-in-out"
        style={{
          opacity: opacity(),
        }}
      />

      {/* Additional gradient overlay for better text contrast */}
      <div
        class="absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
          opacity: 0.8,
        }}
      />
    </div>
  )
}
