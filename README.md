# Miner Santé

![CI](https://github.com/MungangaThelly/minersante/actions/workflows/ci.yml/badge.svg)

Telehealth-oriented React application built with Vite, Supabase Auth, Zustand state, i18n (react-i18next), TailwindCSS, and a basic WebRTC (simple-peer + Supabase realtime) video consultation prototype.

## Continuous Integration
This project uses GitHub Actions for CI. On every push or pull request to `main`, the following steps run automatically:
- Lint (`npm run lint`)
- Build (`npm run build`)
- Test (`npx vitest run`)

See `.github/workflows/ci.yml` for details.

## Stack
- React 19 + Vite
- Supabase Auth & Realtime (appointments, signaling)
- Zustand for lightweight global state
- i18next + language detector + HTTP backend (dynamic JSON under `public/locales`)
- TailwindCSS for styling
- simple-peer for WebRTC P2P media
- react-router-dom for routing

## Getting Started
1. Install dependencies:
```bash
npm install
```
2. Copy environment file:
```bash
cp .env.example .env
```
3. Fill `.env` with your Supabase project credentials & optional API base URL.
4. Start dev server:
```bash
npm run dev
```

## Environment Variables
| Name | Required | Description |
|------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon public key |
| `VITE_API_BASE_URL` | No | Optional custom backend base URL used by `src/api/client.js` |

## Auth Flow
Supabase session bootstrap occurs in `src/main.jsx` (`AuthBootstrap` effect). User object is stored in Zustand (`src/store.js`). Login / signup handled in `components/Auth.jsx`.

## API Client
A small fetch wrapper lives in `src/api/client.js`.
Example:
```js
import api from './api/client';

async function loadPatients() {
  try {
    const patients = await api.get('/patients', { params: { limit: 20 } });
    console.log(patients);
  } catch (e) {
    console.error(e);
  }
}
```
It automatically:
- Prefixes with `VITE_API_BASE_URL`
- Adds `Authorization: Bearer <token>` if `localStorage.auth_token` exists
- Serializes JSON bodies & query params

## Internationalization
Translation JSON files are under `public/locales/<lng>/translation.json`. The user’s language persists using localStorage via `LanguageSwitcher`.

## Video Consultation Prototype
`VideoConsultation.jsx` sets up a peer connection and uses a `signaling` table (via Supabase realtime) to exchange SDP/ICE. This is an experimental baseline—production hardening (TURN servers, reconnection, media error UX) still needed.

## Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |

## Next Steps / Ideas
- Add robust error boundaries per route
- Implement role-based routes (admin vs miner)
- Enhance video (mute state sync, screenshare, TURN config)
- Add form validation (react-hook-form + zod)
- Testing setup (Vitest + React Testing Library)
- Dark mode toggle

## License
MIT (adjust as needed)
