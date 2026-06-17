# Stedtio.ai Frontend — Development Guide

## Build & Run Commands

- **Install Dependencies**: `npm install`
- **Development Server**: `npm run dev` (Runs `next dev`)
- **Build Application**: `npm run build` (Runs `next build`)
- **Start Production Server**: `npm run start` (Runs `next start`)
- **Linting**: `npm run lint` (Runs `eslint`)

## Code Guidelines

- **Language**: TypeScript (`.ts`, `.tsx`).
- **Styling**: Tailwind CSS (version 4) with utility classes. Keep class names clean and avoid arbitrary values where possible.
- **Components**: Focus on functional React components using React hooks (`useState`, `useEffect`).
- **Lucide Icons**: Standardize on `lucide-react` icons (e.g., `Zap`, `ArrowRight`, `Play`, `Sparkles`, `X`, `Menu`).
- **Routing**: Next.js App Router. Use standard directories inside `app/` (e.g., `app/about/page.tsx`, `app/blog/page.tsx`, `app/login/page.tsx`, `app/register/page.tsx`).
- **API Integration**: Connect to backend routes under `http://localhost:5000/api/auth/` for authentication flows.
