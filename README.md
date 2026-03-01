# project-launcher

Dark futuristic Project Launcher built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn-style UI components, Zod validation, in-memory state, and SSE log streaming.

## Stack

- Next.js 14 + React 18
- TypeScript (`strict: true`)
- Tailwind CSS
- Zod request validation
- In-memory build store (`Map`) with deterministic IDs
- SSE (`/api/builds/[id]/logs`) for real-time status + log events

## Setup

```bash
npm install
npm run dev
```

App default URL: `http://localhost:3000`

## Environment Variables

Copy `.env.example` to `.env.local`.

- `NEXT_PUBLIC_APP_URL`: public app origin for metadata/links.

No API keys or secrets are required.

## Route Map

### Pages

- `/` Launch page
- `/build/[id]` Build status page

### APIs

- `GET /api/builds`: list in-memory builds
- `POST /api/builds`: create build (Zod-validated body)
- `GET /api/builds/[id]`: fetch single build
- `GET /api/builds/[id]/logs`: SSE stream (`snapshot`, `build`, `log`, `done`)

## API Validation and Errors

All async handlers are wrapped in `try/catch` and use centralized response helpers.

- Malformed JSON body: `400 MALFORMED_JSON`
- Zod body validation failure: `400 VALIDATION_ERROR` with field details
- Missing entity: `404 NOT_FOUND`
- Unexpected server failure: `500 INTERNAL_ERROR`

Response shape:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "projectName": ["projectName is required"]
    }
  }
}
```

## In-Memory and SSE Behavior

- Build data is non-persistent and resets on server restart.
- Build simulation is deterministic and progresses through queued -> running -> success.
- SSE headers include `X-Accel-Buffering: no` to prevent proxy buffering.
- Stream cleanup is handled directly on abort/cancel (no synthetic abort dispatch).
- SSE write path guards against enqueue-after-close races.

## Responsive Verification Checkpoints

Validate UI at:

- `320px` (mobile baseline)
- `768px` (tablet)
- `1280px` (desktop)

Tailwind breakpoints are explicitly configured for `xs=320`, `md=768`, `xl=1280`.

## Acceptance Checklist Mapping (Issue #1)

- [x] Next.js 14 full-stack app
- [x] Launch page (`/`)
- [x] Build page (`/build/[id]`)
- [x] Dark futuristic glassmorphism tokens and gradients
- [x] Tailwind-only styling + shadcn-style components
- [x] Zod validation with 400 client errors
- [x] Centralized structured API responses
- [x] In-memory store for builds/logs
- [x] SSE real-time log and build updates
- [x] Mobile-first responsive behavior at 320/768/1280

## Known Limitation

Because storage is in-memory, all builds/logs are ephemeral and are lost on process restart.
