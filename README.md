# Audio Playground

A modern web-based audio player application built with SolidJS. Upload audio files, view metadata, control playback, and enjoy synchronized lyrics with auto-scrolling animations.

🔒 **Privacy First**: All audio processing happens locally in your browser. No uploads, no servers, no tracking.

## ✨ Features

- 🎵 **Audio File Upload** - Support for various audio formats (processed locally)
- 📊 **Metadata Analysis** - Extract and display audio file information (browser-only)
- 🎛️ **Playback Controls** - Play, pause, seek, and volume control
- 📝 **Synchronized Lyrics** - LRC format support with auto-scrolling
- ⚡ **Waveform Visualization** - Visual audio waveform display (local processing)
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔒 **Privacy First** - All processing happens in your browser, no uploads
- 🔧 **Built with Modern Tech** - SolidJS, TypeScript, and UnoCSS

## 🛠️ Tech Stack

- **Framework**: [SolidJS](https://www.solidjs.com/) - Reactive UI framework
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Build Tool**: [Vite](https://vitejs.dev/) with rolldown-vite variant
- **Styling**: [UnoCSS](https://unocss.dev/) with Wind3 preset (Tailwind-like)
- **Audio Library**: `audio0` - ZAudio class and waveform generation
- **Metadata Parser**: `node-taglib-sharp-extend` - Audio metadata extraction

## 📄 License

MIT
