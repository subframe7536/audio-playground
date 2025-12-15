# Project Structure

## Root Directory
```
├── src/                    # Source code
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── .kiro/                 # Kiro configuration and steering
├── node_modules/          # Dependencies
├── package.json           # Project configuration
├── index.html             # HTML entry point
├── vite.config.ts         # Vite build configuration
├── tsconfig.json          # TypeScript configuration
├── unocss.config.ts       # UnoCSS styling configuration
└── README.md              # Project documentation
```

## Code Organization

### Entry Points
- `src/index.tsx`: Application bootstrap, imports UnoCSS and renders App
- `src/App.tsx`: Main application component
- `index.html`: HTML template with `#app` mount point

### Configuration Files
- `vite.config.ts`: Vite + SolidJS + UnoCSS plugins
- `tsconfig.json`: Strict TypeScript with path aliases
- `unocss.config.ts`: Wind preset + variant group transformer
- `.oxlintrc.json`: Comprehensive linting rules including SolidJS-specific rules

## Naming Conventions
- **Components**: PascalCase with `.tsx` extension
- **Functions**: Export named functions (e.g., `export function App()`)
- **Imports**: Use consistent type imports with `import type`
- **CSS Classes**: UnoCSS utility classes (Tailwind-compatible)

## File Patterns
- Keep components in `src/` directory
- Use TypeScript for all source files
- Import `uno.css` in entry point for styling
- Follow SolidJS reactivity patterns (see solidjs-best-practice.md)