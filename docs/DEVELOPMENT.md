# Development guide

## Requirements and setup

Use a Node.js release supported by the installed Next.js 16 toolchain and pnpm 9, as declared in `package.json`.

```bash
pnpm install
pnpm dev
```

The app is served at <http://localhost:3000>. The project uses the Next.js App Router, React 19, strict TypeScript, Tailwind CSS v4, ESLint 9, and the `@/*` alias for `src/*`.

## Environment

Create a local `.env.local` file for frontend configuration:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://fieldshiftadaptingfarmswithnasadatabackend-production.up.railway.app
```

`.env*` files are ignored by Git. Values prefixed with `NEXT_PUBLIC_` are embedded in client bundles and must never contain credentials or secrets. Normalize the base URL before composing endpoint paths to avoid duplicate slashes. Do not change backend code to work around frontend issues; document CORS failures for the backend maintainer, including the full frontend domain if a custom domain is involved.

## Repository conventions

- App Router routes and shared document layout live in `src/app`.
- Reusable UI building blocks live in `src/components/ui`.
- Product-specific components belong under `src/features/<feature>`.
- Keep API request construction and response/error handling in `src/services` (or a focused `src/services/api` area).
- Keep API/domain types explicit in TypeScript; parse untrusted responses at boundaries when useful.
- Keep client-only shared state in `src/stores`; do not store a second copy of SWR data there.
- Put global styles in `src/styles/globals.css`; prefer existing primitives and tokens over one-off styling.
- Use React Hook Form and Zod for the advisory form; keep validation consistent with backend constraints.

## Implementation workflow

1. Read [`../AGENTS.md`](../AGENTS.md), [`PRODUCT.md`](PRODUCT.md), and relevant code before editing.
2. Inspect the Figma screen/layer relevant to the work. The provided node is a raster composition; rely on what is visible in the intended screen, not guessed component semantics.
3. Implement one behavior at a time, using live backend responses for production UI and handling all documented states.
4. Keep dependencies minimal and preserve existing project conventions.
5. Run the relevant checks described in [`TESTING.md`](TESTING.md) when requested or appropriate; report exactly what ran.

## Commands

```bash
pnpm dev
pnpm lint
pnpm build
pnpm start
```

