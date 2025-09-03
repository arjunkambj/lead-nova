# Botwisely Monorepo

Saat kit with Monorepo for a Next.js web app with Clerk authentication, Convex backend, and a shared UI library powered by HeroUI and Tailwind CSS v4. Orchestrated with Turborepo and Bun.

## Apps & Packages

- apps/web: Next.js App Router UI, Clerk auth, HeroUI theme.
- apps/convex: Convex backend (functions in `apps/convex/convex`).
- packages/ui: Shared React components.
- packages/eslint-config, packages/typescript-config: Shared configs.

## Requirements

- Node >= 18 and Bun installed.
- Environment variables set per app (see below).

## Setup

```bash
bun install
```

## Development

- All apps: `bun run dev`
- Single app: `bun run dev --filter=web` or `--filter=convex`
- Lint: `bun run lint` • Type-check: `bun run check-types` • Format: `bun run format`

## Build & Run

- Build all: `bun run build`
- Build one: `bun run build --filter=web`
- Start web (after build): `bun --filter=web run start`
- Convex backend (dev): `bun --filter=convex run dev`

## Environment Variables

Create `.env.local` in each app:

- apps/web
  - NEXT_PUBLIC_CONVEX_URL=
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
  - CLERK_SECRET_KEY=
  - (optional) NEXT_PUBLIC_CLERK_FRONTEND_API_URL=
- apps/convex
  - CONVEX_DEPLOYMENT= (or run via `convex dev` to auto-manage)

## UI & Styling (HeroUI + Tailwind v4)

- Global CSS: `apps/web/styles/globals.css` contains Tailwind v4 and HeroUI plugin:
  - `@import "tailwindcss";`
  - `@plugin './hero.ts';` with theme tokens in `styles/hero.ts`.
- Provider: `HeroUIProvider` is applied in `apps/web/components/Provider.tsx`.
- Usage: `import { Button } from '@heroui/react'` and render components directly.

## Authentication (Clerk)

- `ClerkProvider` wraps the app in `apps/web/app/layout.tsx`.
- Sign-in route at `app/(auth)/sign-in/[[...sign-in]]/page.tsx` using `<SignIn />`.
- Use `import { SignedIn, SignedOut, useUser } from '@clerk/nextjs'` in pages/components.

## Convex Integration

- Client is configured in `apps/web/components/ConvexClientProvider.tsx` using `ConvexProviderWithClerk`.
- Ensure `NEXT_PUBLIC_CONVEX_URL` points to your deployment; run backend locally with `bun --filter=convex run dev`.

For contribution guidelines, see AGENTS.md.
