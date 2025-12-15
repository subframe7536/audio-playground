# SolidJS Claude Code Rules

## Solid.js best practice:

- `createSignal()` for simple state
- `createStore()` for complex array or object
- `createMemo()` for derived
- `createEffect()` for side‑effects
- `<For>` for JSX list rendering
- `<Show>` for JSX conditional rendering
- `mergeProps()`/`splitProps()` for props, never break reactivity with destructuring

## Anti-pattern Cheat Sheet

### Don’t break reactivity

```tsx
// ❌ props destructuring
export function Component({ value }: Props) {}

// ✅ keep props object
export function Component(props: Props) {
  console.log(props.value)
}
```

### Don’t import React patterns

```tsx
// ❌
useEffect(() => {}, [dep])

// ✅
createEffect(() => {
  console.log(dep())
})
```

### Don’t use effects for derived state

```tsx
// ❌
const [name] = createSignal('')
const [greeting, setGreeting] = createSignal('')
createEffect(() => setGreeting(`Hello, ${name()}!`))

// ✅
const [name] = createSignal('')
const greeting = createMemo(() => `Hello, ${name()}!`)
```

### Don’t .map lists or use key

```tsx
// ❌ React style
{items().map(item => <div key={item.id}>{item.name}</div>)}

// ✅ Solid style
<For each={items()}>
  {item => <div>{item.name}</div>}
</For>
```