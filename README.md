# SERRA — A Sanctuary Within Stone

> A secluded desert retreat shaped by sandstone, silence, and light. Journey through SERRA, from canyon to sanctuary to the open horizon.

SERRA is an architectural digital experience centered on **one continuous, full-screen, scroll-controlled camera journey**. The visitor moves through a narrow sandstone slot canyon, approaches a turquoise reflecting pool, enters a quiet stone lounge, and emerges onto a terrace overlooking an immense desert canyon.

---

## ✨ Features

- **Continuous 24-Second Architectural Journey**: Powered by smooth native scroll scrubbing over a $940\text{svh}$ container with a clipped $100\text{svh}$ sticky stage.
- **WebGL Depth-Aware Pointer Parallax**: Monocular depth atlas tile sampling ($8 \times 6$ grid, 48 temporal maps) with graceful fallback to native scrubbed video.
- **Procedural Mineral-Haze Loader**: Irregular expanding veil using sinusoidal noise mathematics and weighted readiness tracking (poster, fonts, video buffer).
- **Live Blurred Glass Cards**: Two asymmetrically positioned glass cards at the terrace with synchronized 2D canvas drawing real-time blurred video crops behind warm glass tinting.
- **Editorial Typography**: Inter (400, 450, 500) paired with Cormorant Garamond Italic (400), featuring word-by-word staggered arrivals with blur and 3D translation.
- **Full-Screen Menu & Quality Selector**: Focus-trapped modal dialog with radial gradient, two-column layout, chapter navigation, stillness toggle, and resolution selection (`Auto · adaptive`, `Full HD · 1080p`, `HD · 720p`).
- **Custom Cursor**: Fine-pointer hover cursor featuring an ivory dot, smoothed follower ring (expanding to 53px over interactive targets), and contextual "Enter" badge over `Explore Serra`.
- **Accessibility & Stillness Mode**: Automatic detection of `prefers-reduced-motion`, keyboard skip link (`Skip animation and read the story`), static flow layout with fixed horizon backdrop, and `<noscript>` fallback narrative.
- **Fully Responsive**: Tailored compositions for desktop ($1440 \times 900$, $1280 \times 720$), mobile portrait ($390 \times 844$, $375 \times 667$), and mobile landscape ($844 \times 390$).

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS + Custom PostCSS
- **Graphics**: WebGL (GLSL Shaders) + HTML5 2D Canvas + Video API
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/knight384/SERRA-A-Sanctuary-Within-Stone-prototype-website-.git
cd SERRA-A-Sanctuary-Within-Stone-prototype-website-

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
├── public/
│   └── media/                   # Pre-encoded 24-second films, posters, and depth atlas
│       ├── opening.webp
│       ├── opening-mobile.webp
│       ├── pool.webp
│       ├── interior.webp
│       ├── horizon.webp
│       ├── depth-atlas.webp
│       ├── journey-1080.mp4
│       └── journey-720.mp4
├── src/
│   ├── components/
│   │   ├── CinematicScene.tsx   # WebGL depth-map shader & video scrubbing
│   │   ├── CustomCursor.tsx     # Ivory dot & smoothed follower ring
│   │   ├── GlassCards.tsx       # Live synchronized blurred cards
│   │   ├── Header.tsx           # Wordmark, frosted capsule, & menu controls
│   │   ├── JourneyIndicators.tsx# Vertical rail, scroll cue, & progress line
│   │   ├── MenuDialog.tsx       # Fullscreen accessible dialog & quality selector
│   │   ├── MineralLoader.tsx    # Sinusoidal noise procedural loading veil
│   │   ├── StillnessView.tsx    # Accessible static flow view
│   │   └── StoryOverlay.tsx     # Four-chapter headlines & copy
│   ├── constants/
│   │   ├── chapters.ts          # Chapter copy, cards, and destinations
│   │   └── media.ts             # Media manifest
│   ├── utils/
│   │   └── math.ts              # Clamp & smoothstep functions
│   ├── App.tsx                  # Main stage orchestrator & scroll engine
│   ├── index.css                # Design tokens & custom utilities
│   ├── main.tsx                 # Entry point
│   └── types.ts                 # TypeScript interfaces
├── index.html                   # HTML template with noscript narrative
└── package.json
```

---

## 📄 License

MIT
