# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run setup          # First-time setup: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server with Turbopack
npm run build          # Production build
npm run start          # Start production server

# Testing
npm run test           # Run all tests with Vitest

# Linting
npm run lint           # Next.js ESLint

# Database
npm run db:reset       # Force reset Prisma database
npx prisma generate    # Regenerate Prisma client after schema changes
npx prisma migrate dev # Run new migrations
```

Run a single test file: `npx vitest src/lib/__tests__/file-system.test.ts`

Requires `ANTHROPIC_API_KEY` env var for real AI generation; without it the app falls back to a mock provider that generates static demo components.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in chat, Claude generates React/JSX code using tool calls, and a live iframe preview renders the result in real time.

### Request flow

1. User sends a message → `POST /api/chat` (streaming SSE via Vercel AI SDK)
2. Claude generates code using two tools:
   - `str_replace_editor` — create/modify files (view, create, str_replace, insert commands)
   - `file_manager` — rename/delete files
3. Tool results are applied to the **virtual file system** (in-memory, never writes to disk)
4. `FileSystemContext` broadcasts the update to all consumers
5. `PreviewFrame` transforms JSX with Babel standalone, generates an ES module import map, and loads the result into a sandboxed iframe

### Key abstractions

**Virtual File System** (`src/lib/file-system.ts`) — in-memory POSIX-like FS with full CRUD. Serializes to JSON for database persistence. All generated components live here; `/App.jsx` is always the entry point (enforced by the generation system prompt).

**Provider** (`src/lib/provider.ts`) — selects between the real Anthropic SDK (`claude-haiku-4-5`) and a mock provider. Mock generates predictable static components (Counter, Form, Card) without an API key.

**Tools** (`src/lib/tools/`) — `str_replace_editor` and `file_manager` wrap VFS operations and return structured results back to the AI. Max 40 tool-call steps for real API, 4 for mock.

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) — runs Babel standalone in the browser, creates blob URLs for dynamic module imports, and injects an import map so components can use `react`, `react-dom`, and Tailwind.

**Generation prompt** (`src/lib/prompts/generation.tsx`) — the system prompt instructs Claude to: always use `/App.jsx` as the entry, use Tailwind for styling (no hardcoded styles), and emit components via `str_replace_editor` tool calls.

### State management

- `FileSystemContext` — holds the virtual FS state; all editor and preview components subscribe here
- `ChatContext` — manages conversation history and the streaming `useChat` hook

### Auth

JWT in HTTP-only cookies (jose, 7-day expiry). Passwords hashed with bcrypt. Middleware at `src/middleware.ts` protects routes. Server actions in `src/actions/` handle sign-up, sign-in, and sign-out.

### Data model (Prisma + SQLite)

- `User`: email + hashed password
- `Project`: optional `userId` (nullable for anonymous work), `messages` (JSON string), `data` (JSON string — serialized VFS)
- Anonymous work tracked in localStorage via `src/lib/anon-work-tracker.ts`

### UI layout

Three-panel layout in `src/app/main-content.tsx`:
- **Left (35%):** Chat interface
- **Right (65%):** Tabs — Preview (live iframe) and Code (file tree + Monaco editor)

Component directories: `src/components/chat`, `src/components/editor`, `src/components/preview`, `src/components/auth`, `src/components/ui` (Radix UI primitives).

### Path aliases

`@/` maps to `src/` (configured in `tsconfig.json`).
