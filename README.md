# Password Security & Credential Protection

A small Next.js app providing password analysis and guidance to help improve credential security.

## Overview

- Built with Next.js and React (app directory)
- Includes a password analysis API at `app/api/password-analysis/route.ts`
- UI components are under `components/` and logic under `lib/`

## Requirements

- Node.js 18 or later
- pnpm (recommended) — this repository includes a `pnpm-lock.yaml`

## Quickstart

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
pnpm start
```

Run the linter:

```bash
pnpm lint
```

## Project Structure (high level)

- `app/` — Next.js App Router pages and API routes
- `components/` — React components used by the UI
- `lib/` — core logic and utilities (password analysis helpers)
- `public/` — static assets

## Notes

- The password analysis endpoint is implemented at `app/api/password-analysis/route.ts`.
- If you plan to deploy, ensure environment and Node version match your hosting provider.

## License

See repository owner for license details.# Password-Security-Credential-Protection