---
name: solidjs-guide
description: SolidJS best practices and anti-patterns for reactive UI development
---

# SolidJS Development Guide

You are a specialized agent that helps developers follow SolidJS best practices and avoid common React-style anti-patterns. When invoked, provide guidance on proper SolidJS patterns and correct any anti-patterns you see.

## SolidJS Best Practices

### Choose the Right Reactive Primitive

- `createSignal()` for simple state
- `createStore()` for complex array or object
- `createResource()` for async resource state
- `createMemo()` for derived values
- `createEffect()` for side-effects
- `<For>` for JSX list rendering
- `<Show>` for JSX conditional rendering
- `mergeProps()`/`splitProps()` for props, never break reactivity with destructuring
- `createContext()` for sharing state across component tree without prop drilling

## Anti-pattern Cheat Sheet

### ❌ Don't Break Reactivity

```tsx
// ❌ BAD: props destructuring breaks reactivity
export function Component({ value }: Props) {
  // value is no longer reactive!
}

// ✅ GOOD: keep props object intact
export function Component(props: Props) {
  console.log(props.value) // Reactive access
}
```

### ❌ Don't Import React Patterns

```tsx
// ❌ BAD: React's useEffect with dependency arrays
useEffect(() => {}, [dep])

// ✅ GOOD: SolidJS createEffect tracks automatically
createEffect(() => {
  console.log(dep()) // Automatically tracks dep
})
```

### ❌ Don't Use Effects for Derived State

```tsx
// ❌ BAD: Using effect to compute derived state
const [name] = createSignal('')
const [greeting, setGreeting] = createSignal('')
createEffect(() => setGreeting(`Hello, ${name()}!`))

// ✅ GOOD: Use createMemo for derived values
const [name] = createSignal('')
const greeting = createMemo(() => `Hello, ${name()}!`)
```

### ❌ Don't .map Lists or Use Key Props

```tsx
// ❌ BAD: React style with .map and key
{items().map(item => <div key={item.id}>{item.name}</div>)}

// ✅ GOOD: Solid style with <For>
<For each={items()}>
  {item => <div>{item.name}</div>}
</For>
```

## Context Pattern for State Management

SolidJS uses a context-based pattern for sharing state across the component tree:

```tsx
// ✅ GOOD: SolidJS context pattern for shared state
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

## Common Mistakes to Watch For

### 1. Destructuring Props
**Problem**: Breaks reactivity by extracting values from the props object
**Solution**: Always access props through the props object: `props.value`

### 2. Using Array.map Instead of <For>
**Problem**: Less efficient, doesn't have proper keying behavior
**Solution**: Use `<For each={items()}>{item => ...}</For>`

### 3. Using Effects for Computed Values
**Problem**: Unnecessary complexity and potential bugs
**Solution**: Use `createMemo()` for derived state

### 4. Not Calling Signals as Functions
**Problem**: Forgetting to call signals/memos with `()` breaks reactivity tracking
**Solution**: Always call signals: `value()` not `value`

### 5. Creating Signals/Effects in Render
**Problem**: Creates new instances on every render
**Solution**: Only create reactive primitives at the top level of components

## When to Use This Skill

Invoke this skill when you need to:
- Write new SolidJS components
- Review code for SolidJS anti-patterns
- Understand the difference between SolidJS and React patterns
- Debug reactivity issues
- Set up context-based state management
- Choose the right reactive primitive for your use case

## Quick Reference

| Need | SolidJS Solution |
|------|-----------------|
| Simple reactive value | `createSignal()` |
| Complex nested state | `createStore()` |
| Async data loading | `createResource()` |
| Computed/derived value | `createMemo()` |
| Side effects | `createEffect()` |
| Conditional rendering | `<Show when={condition}>` |
| List rendering | `<For each={array}>` |
| Share state | `createContext()` |
| Props handling | Keep props object intact |
