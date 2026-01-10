import { Show } from 'solid-js'

interface FormFieldProps {
  label: string
  type?: 'text' | 'number'
  value: string | number | ''
  onInput: (value: string | number) => void
  placeholder?: string
  rows?: number
  class?: string
}

export function FormField(props: FormFieldProps) {
  const handleInput = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement | HTMLTextAreaElement
    if (props.type === 'number') {
      const val = target.value
      props.onInput(val === '' ? '' : Number(val))
    } else {
      props.onInput(target.value)
    }
  }

  const inputClasses =
    'flex w-full rounded-md border-(1 gray-700) bg-gray-800/50 p-(x-3 y-2) h-10 text-(sm white) placeholder:(text-gray-500) focus-visible:(outline-none ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900) disabled:(cursor-not-allowed opacity-50) transition-colors'

  const textareaClasses =
    'flex w-full rounded-md border-(1 gray-700) bg-gray-800/50 p-(x-3 y-2) h-150 text-(sm white) placeholder:(text-gray-500) focus-visible:(outline-none ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900) disabled:(cursor-not-allowed opacity-50) resize-none font-mono transition-colors'

  return (
    <div class="space-y-2">
      <label class="text-sm font-medium leading-none text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {props.label}
      </label>
      <Show
        when={props.rows}
        fallback={
          <input
            type={props.type || 'text'}
            value={props.value}
            onInput={handleInput}
            placeholder={props.placeholder}
            class={inputClasses + (props.class ? ' ' + props.class : '')}
          />
        }
      >
        <textarea
          value={props.value as string}
          onInput={handleInput}
          rows={props.rows}
          placeholder={props.placeholder}
          class={textareaClasses + (props.class ? ' ' + props.class : '')}
        />
      </Show>
    </div>
  )
}
