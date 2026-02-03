# brew2 ☕️

A modern, premium Coffee Timer PWA designed for precision brewing. Built with React, TypeScript, and shadcn/ui.

![Brew2 Interface](https://placehold.co/600x400/18181b/fafafa?text=brew2+Preview)

## Features

### 🎨 Premium Experience
-   **Sleek UI**: Minimalist "Zinc" aesthetic with smooth Framer Motion animations.
-   **Theme Aware**: Automatically respects system Dark/Light mode preferences.
-   **Interactive Cards**: Swipeable recipe carousel with "Tap to Reveal" details.

### 🛠 Powerful Recipe Editor
-   **Detailed Control**: Precision inputs for Coffee (g) and Water (ml).
-   **Grind Size**: Slider control (1-41) for exact dial-in.
-   **Temperature**: Toggle between Celsius (°C) and Fahrenheit (°F).
-   **Step Builder**: Create complex recipes with custom steps (Pour, Bloom, Swirl, Stripe/Spin, etc.).
-   **Smart Notes**: Rich text support with auto-clickable links (perfect for saving YouTube tutorials).

### ⏱ Smart Timer
-   **Visual Feedback**: Large, animated circular progress ring.
-   **Wake Lock**: Prevents screen sleep during your brew.
-   **Audio Alerts**: Subtle notifications when steps complete.
-   **Playback Control**: Play, Pause, and Skip steps on the fly.

## Technology Stack
-   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Language**: TypeScript
-   **UI Library**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
-   **State Management**: Zustand
-   **Storage**: LocalStorage (Data stays on your device)

## Getting Started

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Deployment (Docker)
Ideally suited for self-hosting. The container is hardened for security (read-only filesystem, non-root user).

**Using Docker Compose:**
```bash
docker compose up -d --build
```
Access the app at `http://localhost:8090`.

**Security Features:**
-   Runs as unprivileged user (nginx:101)
-   Read-only root filesystem
-   Dropped Linux capabilities
-   Hardened Nginx headers (CSP, HSTS, etc.)

## License
MIT

## Attribution
Concept inspired by [2brew](https://github.com/2brew/2brew.github.io).
