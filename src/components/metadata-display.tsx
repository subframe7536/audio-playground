import { usePlayerContext } from '~/context/player'

export function MetadataDisplay() {
  const [state] = usePlayerContext()

  return (
    <div class="text-white">
      {/* Title and Heart Icon */}
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <h1 class="text-xl font-bold text-white/90 mb-1">{state.metadata?.title || '标题'}</h1>
          <p class="text-sm text-white/60">
            [{state.metadata?.artist || '艺术家'}] · {state.metadata?.album || '专辑名称'}
          </p>
        </div>
      </div>
    </div>
  )
}
