import type { JSX } from 'solid-js'
import { Icon } from './icon'

interface IconButtonProps {
  icon: `lucide:${string}`
  onClick: () => void
  title?: string
  variant?: 'default' | 'primary' | 'danger' | 'plain'
}

const variantClasses = {
  default: 'bg-white/20 hover:bg-white/30',
  primary: 'bg-blue-500/20 hover:bg-blue-500/30',
  danger: 'bg-red-500/20 hover:bg-red-500/30',
  plain: 'opacity-80 bg-transparent hover:(bg-white/10 opacity-100)',
}

export function IconButton(props: IconButtonProps): JSX.Element {
  const variant = () => props.variant || 'default'

  return (
    <button
      onClick={props.onClick}
      class={`size-8 backdrop-blur-sm rounded-lg transition-all duration-200 text-gray-200 line-height-none ${variantClasses[variant()]}`}
      title={props.title}
    >
      <Icon name={props.icon} class="size-4" />
    </button>
  )
}
