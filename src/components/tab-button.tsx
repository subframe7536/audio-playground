import type { JSX } from 'solid-js'

interface TabButtonProps {
  onClick: () => void
  isActive: boolean
  children: JSX.Element
}

export function TabButton(props: TabButtonProps): JSX.Element {
  return (
    <button
      onClick={props.onClick}
      role="tab"
      aria-selected={props.isActive}
      class={`inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md p-(x-3 y-1.5) text-(sm gray-200) font-medium transition-all focus-visible:(outline-none ring-2 ring-blue-500 ring-offset-2) disabled:(pointer-events-none opacity-50) ${
        props.isActive ? 'bg-gray-800 shadow' : 'bg-gray-600 hover:(text-gray-300 bg-gray-700)'
      }`}
    >
      {props.children}
    </button>
  )
}
