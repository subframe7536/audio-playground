import { createMemo } from 'solid-js'
import { usePlayerContext } from '~/context/player'

export interface BackgroundLayerProps {
  opacity?: number
  blurIntensity?: number
}

export function BackgroundLayer(props: BackgroundLayerProps) {
  const { state } = usePlayerContext()

  // Create memoized background style
  const backgroundStyle = createMemo(() => {
    if (state.metadata?.artwork) {
      return {
        'background-image': `url(${state.metadata.artwork})`,
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
      }
    }
    return {}
  })

  return (
    <div class="fixed inset-0 -z-10 overflow-hidden">
      {/* Artwork background with blur */}
      <div
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out transform scale-110"
        style={{
          ...backgroundStyle(),
          filter: `blur(${props.blurIntensity ?? 32}px)`,
          opacity: state.metadata?.artwork ? 0.7 : 0,
        }}
      />

      {/* Fallback gradient background */}
      <div
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{
          background: 'linear-gradient(135deg, #fbdea4ff 0%, #badbbcff 60%, #78b4f4ff 100%)',
          opacity: state.metadata?.artwork ? 0 : 1,
        }}
      />

      {/* Contrast overlay for text readability */}
      <div
        class="absolute inset-0 bg-black transition-opacity duration-500 ease-in-out"
        style={{
          opacity: props.opacity ?? 0.9,
        }}
      />

      {/* Additional gradient overlay for better text contrast */}
      <div
        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-80"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  )
}
