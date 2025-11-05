# Repository Guidelines

## Project Structure & Module Organization
- Next.js 14 App Router; primary code lives in `src/`.
- `src/app` holds route segments (`auth`, `dashboard`, `settings`) and API handlers.
- `src/actions` contains server actions; `src/lib` centralizes types and utilities; contexts, hooks, and styles reside in sibling folders.
- Reusable UI, including the shadcn set, is under `src/components` and `src/components/ui`.
- Root `lib/` stores backend connectors such as `database.js`; static assets and manifests sit in `public/`.
- Root configs (`next.config.js`, `tailwind.config.js`, `tsconfig.json`, `vercel.json`) and `deploy.sh` govern builds and deployments.

## Build, Test, and Development Commands
- `npm install` to sync dependencies.
- `npm run dev` starts the Next dev server; `npm run server` runs the Express proxy; `npm run dev:full` launches both.
- `npm run build` compiles the production bundle and `npm run start` serves it locally.
- `npm run lint` enforces the Next.js ESLint profile.
- `npm run db:setup` seeds a local MySQL instance using `database_schema.sql`.

## Coding Style & Naming Conventions
- TypeScript-first with `.tsx` React components and two-space indentation.
- Use `PascalCase` for components, `camelCase` for functions/hooks, and `kebab-case` for route folders.
- Favor Tailwind utility classes for styling; centralize reusable variants with `class-variance-authority`.
- Import via the `@/` alias instead of deep relative paths.
- Run `npm run lint` (plus Prettier defaults) before pushing.

## Testing Guidelines
- No automated suite yet—add targeted tests beside new features with a `.test.ts(x)` suffix (e.g., `DashboardClient.test.tsx`).
- Cover edge cases such as empty datasets, failed API calls, and auth state changes.
- Until a runner is introduced, rely on `npm run lint` and manual verification to block regressions.
- Document any new testing scripts or tooling in the PR description.

## Commit & Pull Request Guidelines
- Keep commits short and imperative (`Fix Vercel deployment configuration`).
- Reference issues or tasks, and add brief bodies when extra context is needed.
- PRs should summarize the change, list manual verification, link issues, and attach screenshots or GIFs for UI updates.
- Highlight database or environment updates so reviewers can adjust `.env.local`.

## Configuration & Security Notes
- Copy `env.example` to `.env.local`; never commit secrets.
- Align variables with `config.js` and `lib/database.js`, and keep credentials in server actions under `src/actions`.
- Review `deploy.sh` and `vercel.json` before altering deployment flows to preserve environment parity.
