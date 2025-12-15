// import type json from '@iconify-json/lucide/icons.json'
export interface Props {
  name: `lucide:${string}`
  class?: string
  title?: string
}

export function Icon(props: Props) {
  return (
    <div class={`i-${props.name} inline-block ${props.class}`} title={props.title || props.name} />
  )
}
