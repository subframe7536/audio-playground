# Styling Guidelines

## UnoCSS Integration

This library uses **UnoCSS** with the Wind preset (Tailwind-compatible) for styling components. UnoCSS provides atomic CSS utilities that are generated on-demand.

### Key Features

- **Wind Preset**: Tailwind CSS compatible utility classes
- **Variant Groups**: Use `hover:(bg-blue-500 text-white)` syntax for cleaner code
- **Atomic CSS**: Only generates CSS for classes actually used
- **TypeScript Support**: Full IntelliSense for utility classes

### Icon

use `src/components/icon.tsx`

```tsx
import { Icon } from '~/components/icon'

export function App() {
  return (
    <div class="text-red">
      <Icon name="lucide:a-arrow-down" class="mr-2" />
      test
    </div>
  )
}
```