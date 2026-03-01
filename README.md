# project-launcher

Dark futuristic Project Launcher portal built with Next.js 14, TypeScript, Tailwind CSS, shadcn-style components, Zod validation, in-memory build lifecycle simulation, and SSE real-time logs.

## Run

- `npm install`
- copy `.env.example` to `.env.local`
- `npm run dev`

## Routes

- `/` launch page
- `/build/[id]` live build status page

## API

- `POST /api/projects`
- `GET /api/projects/[id]`
- `GET /api/projects/[id]/events` (SSE)

## Notes

- Request body validation uses Zod.
- API errors are structured and include status-appropriate responses.
- SSE stream includes heartbeat and proper cleanup on abort/cancel/close.
- UI is mobile-first and designed for 320px, 768px, and 1280px breakpoints.
