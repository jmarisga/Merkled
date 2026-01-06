# Merkled - Digital Evidence Sealer 🔒

A Chrome/Edge extension for file preservation using Merkle Tree cryptographic hashing.

## Quick Start

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Build the extension
npm run build:extension

# 3. Load in Chrome/Edge
#    - Go to chrome://extensions/
#    - Enable "Developer mode"
#    - Click "Load unpacked"
#    - Select the frontend/dist folder
```

## Features

- **Seal**: Hash files/folders using SHA-256 Merkle Trees
- **Verify**: Re-upload to detect any tampering
- **Export**: Save manifests as JSON or PDF
- **Offline**: All processing happens locally in browser

## Usage

1. Click the extension icon
2. Drag & drop a folder or click "Select Folder"
3. Click "Generate Merkle Root"
4. Export manifest (JSON/PDF) for proof

## Development

```bash
npm run dev        # Start dev server at localhost:5173
npm run build:extension  # Build for Chrome/Edge
```

## Project Structure

```
frontend/
├── src/app/components/  # UI components
├── src/utils/           # Merkle Tree logic
├── public/              # Extension manifest & icons
└── dist/                # Built extension (load this in Chrome)
```

## Tech Stack

React 18 • TypeScript • Vite • Tailwind CSS • Web Crypto API • merkletreejs

---

MIT License
  