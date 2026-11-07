# Agent guide

## Start here

1. Read this file and [`docs/PRODUCT.md`](docs/PRODUCT.md) before changing product behavior.
2. Read [`ARCHITECTURE.md`](ARCHITECTURE.md) and inspect the relevant source files before editing. This repository is still a starter; do not assume a feature described in docs is already implemented.
3. Use the linked Figma file as visual reference. Inspect the relevant screen/layer in Figma before inferring visual details; its current top-level node is a grouped raster composition rather than a structured component library.
4. Keep changes focused on the requested work and preserve the configured Next.js, React, TypeScript, Tailwind CSS v4, and shadcn-style component setup unless requirements call for a deliberate change.

## Product and data rules

- Follow [`docs/PRODUCT.md`](docs/PRODUCT.md) as the source of truth for regions, endpoints, fields, states, and data interpretation. `product.txt` is the original detailed requirements document.
- Do not invent NASA observations, historical data, forecasts, telemetry, advisories, API fields, or backend capabilities. Do not ship mock values as production data.
- Preserve backend units, dates, statuses, limitations, and disclaimer. Null or unavailable measurements are shown as unavailable, never as zero.
- Distinguish NASA observations, satellite imagery, user inputs, and advisory interpretations. A representative sample point is not a regional average; imagery is not an exact ground measurement; a screening score is not a measured probability.
- Keep secrets out of browser code. `NEXT_PUBLIC_*` variables are public.
- Do not modify backend code as part of frontend work.

## Implementation conventions

- TypeScript is strict. Add/update types at API boundaries and keep parsing/transport separate from presentation.
- Prefer small feature-focused components and reuse `src/components/ui` primitives where they fit. Avoid premature abstractions and dependencies.
- Keep server/API state in SWR when that integration is added; use Zustand for client-only shared UI state; use React Hook Form and Zod for advisory input. Do not duplicate fetched server state in Zustand.
- Use semantic HTML, keyboard-accessible controls, visible focus, descriptive labels, sufficient contrast, and reduced-motion-aware animation.
- Handle loading, error, retry, partial, unavailable, and empty states for network-backed features.
- Keep layouts responsive across phone, tablet, and desktop widths. Do not rely on color alone to convey metric status.
- Keep documentation accurate: label planned behavior separately from code that exists today.

## Completion

- Follow [`docs/TESTING.md`](docs/TESTING.md) for appropriate checks. Do not claim a check passed unless it was run and succeeded.
- Review the final diff for accidental changes and update the relevant docs when architecture, commands, or product behavior changes.
- Do not add dependencies or run tests unless the task calls for them; ask only when an external decision or access is genuinely required.

