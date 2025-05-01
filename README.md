# Collaborative Markdown Editor

A real-time collaborative markdown editor that works peer-to-peer, built with Svelte, Yjs and WebRTC.

## Overview

This project allows multiple users to simultaneously edit markdown documents in real-time without requiring a central server. All collaboration happens directly between peers' browsers using WebRTC technology.

## Features

- Real-time collaborative editing
- Peer-to-peer connection (no central server needed)
- Markdown preview
- Syntax highlighting
- Automatic conflict resolution
- Works offline (changes sync when reconnected)
- Session persistence

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/mateoroldos/collaborative-markdown.git
cd collaborative-markdown

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm run dev

# Turn on the WebRTC signaling server
PORT=4444 node ./node_modules/y-webrtc/bin/server.js
```

### Building for Production

```bash
# Create a production build
pnpm run build

# Preview the production build locally
pnpm run preview
```

## How to Use

1. Start the application and share the unique room URL with collaborators
2. Each collaborator with the link can join the editing session
3. Changes are synchronized in real-time between all participants
4. The document is automatically saved in the browser's local storage

## Architecture

The application uses:

- Svelte and SvelteKit for the UI and application framework
- WebRTC peer-to-peer connections
- Yjs for conflict-free replicated data types (CRDT)
- IndexedDB for local storage of documents

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with [Svelte](https://svelte.dev/) and [Yjs](https://yjs.dev/)
