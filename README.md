# 📻 AURA // Audio Zine & Paper Sound Machine

> **Handcrafted, bit-perfect local audio & podcast player with tactile paper aesthetics, responsive across desktop and smartphones.**

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)
![Deployment](https://img.shields.io/badge/Vercel-Ready-black.svg)

---

## ✨ Features

- ✂️ **Handcrafted 2-Second Zig-Zag Paper Tear Intro**: Organic, non-uniform paper rip animation with deckle edges and flying fiber flecks before opening the audio zine. Clickable replay badge in title bar.
- 🎵 **Bit-Perfect Local Audio Playback**: Direct browser file decoding supporting `.flac`, `.mp3`, `.wav`, `.m4a`, `.ogg`, `.aac`, `.opus`, `.alac`, `.aiff`, `.wma`.
- 🎤 **Synchronized Karaoke Lyric Scroll**: Real-time `.lrc` lyric parser with active lyric auto-scroll and highlight.
- 📱 **100% Mobile & Smartphone Responsive**:
  - Optimized for Android Chromium & iOS mobile browsers.
  - Safe-area insets (`env(safe-area-inset-bottom)`) and dynamic viewport height (`100dvh`).
  - Mobile slide-out library drawer and compact tactile player bar with top micro scrub line.
  - Full-screen Studio Notebook bottom sheet for live lyrics on phones.
- 🎨 **Artisan Craft Aesthetic**: Paper grain texture, washi tape stickers, rubber stamps, typewriter typography (`Space Mono`), and handwriting accents (`Caveat`).
- 🌓 **Dual Themes**: Switch seamlessly between **Warm Kraft Paper** and **Midnight Chalkboard** themes.
- 🎛️ **Walkman Transport & Studio Telemetry**: Tape speed multiplier (1x, 1.25x, 1.5x, 2x), spectrum analyzer visualizer, and tape EQ presets.

---

## 🚀 Instant Deployment to Vercel

This repository includes a pre-configured `vercel.json` for zero-configuration deployment.

### Option 1: Via Vercel Dashboard (Easiest)

1. Push this project to your GitHub account (see [Push to GitHub](#-push-to-github) below).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Import your newly created GitHub repository.
5. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your site will be live in ~30 seconds!

### Option 2: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## 📦 Push to GitHub

To upload this project into a new GitHub repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage and commit all files
git add .
git commit -m "Initial commit: Aura Audio Zine web app"

# 3. Rename branch to main
git branch -M main

# 4. Link your remote GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 5. Push to GitHub
git push -u origin main
```

> **Note**: `node_modules`, `dist`, `.vercel`, and system cache files are automatically excluded by `.gitignore`.

---

## 💻 Local Development

### Prerequisites

- Node.js 18+ or 20+
- npm (or pnpm / yarn)

### Quick Start

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
# Typecheck & build production bundle into /dist
npm run build

# Preview production build locally
npm run preview
```

### Linting

```bash
npm run lint
```

---

## 📂 Project Architecture

```
Project1/
├── index.html                 # App HTML root with mobile meta tags & fonts
├── vercel.json                # Vercel SPA routing and build configuration
├── vite.config.ts             # Vite configuration with React plugin
├── tailwind.config.js         # Custom paper/chalk palette and textures
├── tsconfig.json              # TypeScript root configuration
├── package.json               # Dependencies and build scripts
├── .gitignore                 # Excludes node_modules, dist, .vercel
│
├── public/                    # Static assets & favicons
│   ├── favicon.svg            # Custom AURA audio favicon
│   └── icons.svg
│
└── src/
    ├── main.tsx               # React DOM entrypoint
    ├── index.css              # Paper grain, washi tape, and mobile safe area styles
    ├── App.tsx                # Main container, responsive state & drawer management
    │
    ├── components/            # UI Components
    │   ├── PaperTearIntro.tsx # 2-second organic zig-zag paper tear unboxing animation
    │   ├── TitleBar.tsx       # Responsive header, search & mobile menu trigger
    │   ├── Sidebar.tsx        # Library drawer (off-canvas on mobile, column on desktop)
    │   ├── HeroBanner.tsx     # Cassette turntable banner with responsive button layout
    │   ├── TrackList.tsx      # Table with responsive columns & Polaroid grid view
    │   ├── PlayerBar.tsx      # Tactile Walkman player with mobile compact micro-scrubber
    │   ├── NowPlayingPanel.tsx# Studio Notebook with synchronized .lrc lyrics & EQ
    │   ├── VisualizerCanvas.tsx# Real-time Web Audio API spectrum canvas
    │   └── DropZoneOverlay.tsx# Drag-and-drop file import overlay
    │
    ├── services/              # Core Services
    │   ├── audioEngine.ts     # Web Audio API engine & audio element controller
    │   ├── sampleTracks.ts    # Built-in synthetic audio tracks
    │   └── syntheticAudio.ts  # Offline synthesized sound generator
    │
    ├── utils/                 # Helpers
    │   ├── lrcParser.ts       # Synchronized karaoke lyric parser (.lrc)
    │   └── metadataExtractor.ts # In-browser ID3 and audio metadata reader
    │
    └── types/
        └── audio.ts           # TypeScript models and interfaces
```

---

## 📄 License

MIT License © 2026 Aura Audio.
