import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

interface ButtonProps {
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  loading?: boolean
  children: JSX.Element
}

export function Button(props: ButtonProps): JSX.Element {
  const variant = () => props.variant || 'primary'

  const baseClasses =
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:(outline-none ring-2 ring-blue-500 ring-offset-2) disabled:(pointer-events-none opacity-50) h-10 px-4 py-2'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:(bg-blue-700)',
    secondary: 'border border-gray-700 bg-transparent text-white hover:(bg-gray-800)',
  }

  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      class={`${baseClasses} ${variantClasses[variant()]} ${props.loading ? 'gap-2' : ''}`}
    >
      <Show when={props.loading}>
        <div class="h-4 w-4 animate-spin rounded-full border-(2 white t-transparent)" />
      </Show>
      {props.children}
    </button>
  )
}
