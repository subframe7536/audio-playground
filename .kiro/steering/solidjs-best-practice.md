# SolidJS Claude Code Rules

## Solid.js best practice:

- `createSignal()` for simple state
- `createStore()` for complex array or object
- `createResource()` for async resource state
- `createMemo()` for derived
- `createEffect()` for side‑effects
- `<For>` for JSX list rendering
- `<Show>` for JSX conditional rendering
- `mergeProps()`/`splitProps()` for props, never break reactivity with destructuring
- `createContext()` for sharing state across component tree without prop drilling

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

### Context Pattern for State Management

```tsx
// ✅ SolidJS context pattern for shared state
const PlayerContext = createContext<[PlayerState, PlayerActions]>()

function PlayerProvider(props: { children: JSX.Element; audioFile?: File }) {
  const [state, setState] = createStore<PlayerState>(initialState)
  
  const actions: PlayerActions = {
    play: () => { /* ... */ },
    pause: () => { /* ... */ },
    seek: (time: number) => { /* ... */ }
  }
  
  return (
    <PlayerContext.Provider value={[state, actions]}>
      {props.children}
    </PlayerContext.Provider>
  )
}

function usePlayerContext() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayerContext must be used within PlayerProvider')
  return context
}

// Usage in components
function AudioControls() {
  const [state, actions] = usePlayerContext()
  return <button onClick={actions.play}>Play</button>
}
```