# Project Launcher

> Built with [Dark Factory v4](https://github.com/ibuzzardo/dark-factory-v4) — autonomous AI software development pipeline

AI-powered project launcher portal with a dark futuristic UI. Submit project briefs, watch builds execute in real-time via Server-Sent Events, and track pipeline stages.

## Features

- **Project Brief Submission** — Guided multi-step form with validation
- **Real-Time Build Tracking** — SSE event stream with reconnect-safe replay
- **6-Stage Pipeline Timeline** — Visual progress through plan → design → code → review → test → deploy
- **Live Log Feed** — Streaming build output as it happens
- **Build Statistics** — Token usage, cost tracking, timing data

## Tech Stack

- Next.js 14, TypeScript, Tailwind CSS
- shadcn-style components
- Zod request validation
- Server-Sent Events (SSE) for real-time updates
- In-memory build lifecycle simulation

## Getting Started

```bash
git clone https://github.com/ibuzzardo/project-launcher.git
cd project-launcher
cp .env.example .env.local
npm install
npm run dev
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Launch page — submit project briefs |
| `/build/[id]` | Live build status with SSE streaming |

## API

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/projects` | Create a new project build |
| GET | `/api/projects/[id]` | Get project status |
| GET | `/api/projects/[id]/events` | SSE event stream |

## License

MIT — see [LICENSE](LICENSE)
