# Farm Sense

Farm Sense is a farmer-friendly agricultural decision-support experience for Myanmar. It brings NASA Earth observation context, regional environmental telemetry, an interactive satellite imagery explorer, and backend-generated agricultural advisories into one responsive workspace.

## Project status

This project now includes the Farm Sense dashboard, live telemetry integration, NASA tile map, date-range controls, advisory form, and metric explanations. The production API responds to direct telemetry requests, but browser requests from localhost currently fail because of network/CORS access; the app shows an error and never replaces unavailable data with mock values. See [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) and [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for current status and next steps. Treat the supplied [Figma design](https://www.figma.com/design/lLVm7B5Sn94vhRLV7xV5fU/farm?node-id=0-1) as the visual reference. It is a grouped raster composition, so inspect the design itself before assuming exact component structure or tokens.

## Quick start

Requirements: Node.js compatible with the installed Next.js version and pnpm 9 (the package manager declared by this repository).

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. Configure `NEXT_PUBLIC_API_BASE_URL` for browser-side API calls when integrating the backend. The documented production default is the Railway API listed in [`docs/PRODUCT.md`](docs/PRODUCT.md). Never place secrets or NASA Earthdata credentials in a public variable.

## Useful commands

```bash
pnpm dev       # Local development server
pnpm lint      # ESLint
pnpm build     # Production build
pnpm start     # Serve a production build
```

## Project guide

- [`AGENTS.md`](AGENTS.md): instructions for agents and contributors
- [`ARCHITECTURE.md`](ARCHITECTURE.md): current structure and target boundaries
- [`docs/PRODUCT.md`](docs/PRODUCT.md): product behavior, data rules, and API contract
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md): workflow, conventions, and environment
- [`docs/TESTING.md`](docs/TESTING.md): verification expectations and commands
- [`product.txt`](product.txt): original product requirements source
