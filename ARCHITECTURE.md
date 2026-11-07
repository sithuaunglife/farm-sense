# Architecture

## Current repository

The project is a Next.js App Router application using Next.js 16, React 19, TypeScript with strict mode, Tailwind CSS v4, and shadcn-style UI primitives. The `@/*` alias resolves to `src/*`.

```text
src/
  app/                 App Router entry points, layout, route pages
  components/ui/       Reusable UI primitives
  features/            Feature-oriented UI (currently example scaffold)
  services/            Service layer (currently example auth service)
  stores/              Client state (currently example store)
  styles/              Global styles
  types/               Shared TypeScript types
public/                Static assets
docs/                  Product and engineering guidance
```

`src/app/page.tsx` renders the Farm Sense dashboard. The root layout loads the shared theme and Leaflet styles. `src/features/farm-sense` contains the dashboard, telemetry hook, satellite map, and advisory form; `src/services/farm-sense-api.ts` owns API URL construction and fetch/error handling; `src/stores/useFarmSenseStore.ts` owns the selected region. SWR owns remote telemetry state; Zustand stores only the selected region.

The app requests live telemetry and tiles from the documented API. The production API accepted a direct telemetry request during development, but browser requests from `http://localhost:3000` currently fail with a network/CORS error. The frontend shows a retryable error and must not substitute demo measurements. The backend needs to allow the deployed frontend origin for direct browser requests to work. Advisory form fields and response rendering are implemented from the documented request contract; response rendering preserves backend fields because no advisory response schema was supplied. There is no dedicated automated test suite yet.

## Target feature boundaries

As the product grows, keep Next.js route/layout concerns in `src/app`, and continue organizing the experience by feature. A reasonable structure is:

```text
src/
  app/
  components/ui/
  features/
    farm-sense/          Dashboard, map, telemetry hook, advisory
  services/
    api/                URL construction, fetch/error handling, API clients
  stores/               Shared client-only UI state
  types/                API and domain types
```

Keep API transport, domain/API types, client state, form logic, and rendering responsibilities distinct. Avoid creating a generic layer until at least two real use cases need it.

## Data and state flow

1. A user chooses a supported region or date range in client UI state.
2. SWR fetches telemetry from the configured API, keyed by region and optional range. It owns cache/revalidation state; Zustand must not mirror telemetry responses.
3. Typed feature components render the returned status, values, units, dates, source, cache indicator, and limitations without substituting missing values.
4. The map builds tile URLs from the same base URL, the chosen Terra/Aqua layer, observation date, and Web Mercator tile coordinates.
5. The advisory form uses React Hook Form plus Zod to validate user inputs; it sends a POST only after explicit Evaluate submission, then renders backend rationale and disclaimer.

Use browser-side requests as specified by the product requirements. Normalize trailing slashes in the base URL. Surface backend error messages when available, while handling malformed or absent error payloads safely.

## Runtime configuration and dependencies

- `NEXT_PUBLIC_API_BASE_URL`: public API base URL. Product default: `https://fieldshiftadaptingfarmswithnasadatabackend-production.up.railway.app`.
- Never expose NASA Earthdata tokens, private keys, or other secrets in frontend bundles.
- Add SWR, Zustand, React Hook Form, Zod, and a map dependency only when implementing their corresponding features; avoid unnecessary packages.
- Preserve the configured styling system and existing UI primitives. Use the Figma reference to guide appearance, but do not treat its raster composition as a code architecture.

## Reliability and accessibility

Represent loading, HTTP error, partial success, unavailable values, stale cache, and empty results distinctly. Provide retry actions where a request can be repeated. Keep API models faithful to backend payloads and label any derived presentation as such. Meet keyboard, contrast, labeling, responsive layout, and reduced-motion requirements from [`docs/PRODUCT.md`](docs/PRODUCT.md).

