# Repository Guidelines

## Project Structure & Module Organization

- apps: runnable apps.
  - apps/web: Next.js (App Router: `app/`, components in `components/`, styles in `styles/`).
  - apps/convex: Convex backend (`convex/` functions, `_generated/` API).
- packages: shared code.
  - packages/ui: React components (`src/*.tsx`).
  - packages/eslint-config, packages/typescript-config: shared configs.
- Tooling: `turbo.json` (tasks), `package.json` (root scripts), `bun.lock` (Bun).

## Build, Test, and Development Commands

- Dev (all workspaces): `bun run dev` (Turbo orchestrates `dev`).
- Dev (one app): `bun run dev --filter=web` or `--filter=convex`.
- Build: `bun run build` (or filter one target: `--filter=web`).
- Lint: `bun run lint` (Next.js/ESLint per package).
- Type check: `bun run check-types` (tsc noEmit across workspaces).
- Format: `bun run format` (Prettier on `ts/tsx/md`).

## Coding Style & Naming Conventions

- Language: TypeScript (strict). Indent 2 spaces, semicolons default.
- ESLint: use `@repo/eslint-config` (Next.js, React Hooks, Prettier compatible).
- Formatting: Prettier required; run before committing.
- React components: PascalCase files and exports (e.g., `Button.tsx`).
- Next.js app routes under `apps/web/app`; server code avoids `NEXT_PUBLIC_*` vars.
- Paths: prefer `@/*` alias where configured (see `tsconfig.json`).

## UI (HeroUI) & Auth (Clerk)

- HeroUI: global provider in `apps/web/components/Provider.tsx` (`HeroUIProvider`).
- Tailwind v4 plugin: see `apps/web/styles/globals.css` and `styles/hero.ts`.
- Import components from `@heroui/react` (e.g., `import { Button } from '@heroui/react'`).
- Clerk: global `ClerkProvider` in `apps/web/app/layout.tsx`; auth route at `app/(auth)/sign-in/[[...sign-in]]/page.tsx`.
- Convex + Clerk: `ConvexProviderWithClerk` in `components/ConvexClientProvider.tsx` binds auth to data layer.

## Testing Guidelines

- No test runner is configured yet. When adding tests:
  - Use Vitest + React Testing Library for UI; place files as `*.test.ts(x)` next to sources or in `__tests__/`.
  - Add a `test` script in each package and wire Turbo (`turbo run test`).
  - Aim for meaningful coverage on UI logic and Convex functions.

## Commit & Pull Request Guidelines

- Commits: prefer Conventional Commits (e.g., `feat(web): add auth route`, `fix(ui): button aria-label`). Keep messages imperative and scoped.
- PRs: include clear description, linked issues, and screenshots for UI changes. Note env or migration steps. Ensure `bun run lint` and `bun run check-types` pass.

## Repository Rules

- Always Follow @rules_convex.md and @Rules_performance.md for convex
- Always Follow @rules_Style.md and @Rules_performance.md for nextjs
- Always keep page.tsx serve components and use client on sub compoents for nextjs/web
- Keep Componetns Modular
- Write type in package/types
- and the convex logic in hooks folder ie web/hooks or mobile/hooks dont use directly in compoents
