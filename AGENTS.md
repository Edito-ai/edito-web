# Agent Rules for Edito.ai Frontend

This is a Next.js (version 16) project with Tailwind CSS v4 and React 19.

## 📁 Folder Structure
- `app/`: Next.js pages, layouts, and route handlers.
- `components/`: Reusable, modular UI components (e.g. `Navbar.tsx`, `Hero.tsx`, `Playground.tsx`).
- `public/`: Static assets (logos, videos).

## 💡 Developer Guidelines
- **Client Components**: Always include `"use client"` at the very top of files that make use of hooks (`useState`, `useEffect`) or interact with DOM elements directly (e.g., `window`, `document`).
- **Interactive UI & Popups**: Use modular components (e.g., custom trigger events or local states) to control modals, popups, and simulations without polluting core layouts.
- **Animations**: Prefer standard CSS keyframe transitions inside component style-tag setups or Tailwind transitions for custom modal effects.
- **TypeScript Strictness**: Type all event handlers, component properties, and state objects explicitly to maintain typesafety.
