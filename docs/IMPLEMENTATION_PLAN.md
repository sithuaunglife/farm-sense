# Implementation plan

This plan sequences the remaining Farm Sense work from the current partial implementation toward the product described in [`PRODUCT.md`](PRODUCT.md). Keep the Figma reference and backend contract in view as each phase is completed.

## Current implementation status

- Implemented: responsive dashboard shell, supported-region selector, SWR telemetry request, metric states and provenance, date-range validation and requests, Terra/Aqua NASA tile map, validated advisory form, and data explanations.
- Verified: telemetry endpoint responds to a direct request with the documented live data shape; ESLint and production build pass.
- Blocked by deployment configuration: browser requests from `http://localhost:3000` currently fail with a network/CORS error. The backend must allow the frontend origin for direct browser access.
- Needs backend confirmation: no advisory response schema was provided. The UI renders returned fields generically and displays a backend disclaimer when present; verify against an approved response example before finalizing recommendation-specific presentation.
- Not present: dedicated automated unit, integration, or browser test suite.

Continue at the CORS/configuration and response-contract verification points below, then complete acceptance checks. Keep unavailable data visibly unavailable until the backend connection works.

## Priority overview

| Priority | Work | Outcome |
| --- | --- | --- |
| P0 | Baseline, design/API discovery, shared foundation | A reliable starting point and agreed contracts |
| P1 | Dashboard and live telemetry | Core regional environmental overview using live backend data |
| P1 | NASA imagery map | Region exploration with date and Terra/Aqua layer controls |
| P1 | Agricultural advisory | Validated user inputs and backend-generated recommendations |
| P2 | Date-range data exploration and education | Clearer historical context and metric explanations |
| P2 | Accessibility, responsive, visual polish | A usable experience across devices and input methods |

P1 features should be implemented in order: telemetry first, then map, then advisory. This order establishes the selected-region and data-display foundations before adding dependent map context and the separate advisory workflow.

## Phase 0: Baseline and discovery

1. Inspect the existing App Router code, styles, UI primitives, scripts, and installed dependencies.
2. Run the existing lint and production build commands to establish a baseline.
3. Inspect the relevant Figma screens and assets; identify layout, responsive variants, visual hierarchy, and reusable patterns from the design itself.
4. Confirm API request and response payloads for telemetry, advisory, and map tiles. Do not infer fields absent from the backend contract.
5. Record any contract or access gaps before depending on them. Do not fill gaps with invented data.

**Exit condition:** implementation scope and visual target are understood, and API boundaries are typed from the available contract.

## Phase 1: Shared application foundation

1. Replace starter metadata and example page content as the product shell is introduced.
2. Establish shared layout, navigation, responsive containers, typography, colors, spacing, and accessible interaction states in the existing styling system.
3. Define domain and API types for supported regions, telemetry, advisory, and backend errors.
4. Add a focused browser API client using `NEXT_PUBLIC_API_BASE_URL`; normalize trailing slashes and surface backend errors safely.
5. Introduce dependencies only as their features are implemented: SWR for remote data, Zustand for shared UI state, React Hook Form and Zod for advisory input, and a map library for imagery.

**Exit condition:** shared UI and API conventions are in place without duplicating server data in client state.

## Phase 2: Dashboard and live telemetry (P1)

1. Implement the shared dashboard shell and selector for Ayeyarwady, Central Dry Zone, Shan Highlands, and Coastal Rakhine.
2. Fetch `GET /api/v1/telemetry/region/{region_id}` with SWR when the region changes; support optional validated date parameters later in the exploration phase.
3. Render soil moisture, land surface temperature, NDVI, and rainfall with returned units, observation dates, sources, and status.
4. Implement loading, error/retry, partial, unavailable, null metric, and stale-cache states.
5. Add concise metric context and limitations; distinguish representative sample points from regional averages.

**Acceptance checks:** region selection makes live requests; partial data remains useful; unavailable/null values never become zero; cached data and source/measurement context are clear.

## Phase 3: NASA map and imagery (P1)

1. Integrate the map library and supported region selection with dashboard state.
2. Construct tile URLs from the configured API base, `true_color_terra` / `true_color_aqua`, selected observation or past date, and Web Mercator `{z}/{x}/{y}` coordinates.
3. Enforce zoom levels 0–9 and add clear layer, date, region, and map controls.
4. Add imagery loading/error states and explain that satellite imagery is not an exact ground-level measurement.

**Acceptance checks:** tile requests use the configured API and valid coordinates/layers/dates; imagery dates and layers are visible; controls work on keyboard and touch layouts.

## Phase 4: Agricultural advisory (P1)

1. Build region, soil type, current crop, and target season inputs.
2. Validate with React Hook Form and Zod: supported enum values, required crop, and maximum 40 characters.
3. Send `POST /api/v1/advisory/evaluate` only after explicit Evaluate submission.
4. Display loading/error states and backend-provided irrigation advice, urgency, pest screening score/confidence, crop rotation/suitability, rationale, and disclaimer.
5. Handle null scores and faithfully label screening scores and non-forecast-based irrigation recommendations.

**Acceptance checks:** invalid inputs do not send requests; results preserve backend meaning and always include the backend disclaimer.

## Phase 5: Data exploration and education (P2)

1. Add optional `start_date` and `end_date` controls to telemetry exploration.
2. Reject future dates and ranges over 90 days; omit date parameters when backend default dates are desired.
3. Present observation dates, sources, limitations, and comparisons across supported metrics.
4. Add short plain-language explanations of soil moisture, land surface temperature, NDVI, and rainfall.
5. Add trends or charts only when sufficient real historical data is available.

**Acceptance checks:** date boundaries match the backend rules; trends never imply missing or fabricated observations.

## Phase 6: Accessibility, responsive design, and polish (P2)

1. Compare implemented views against the Figma reference and correct meaningful layout or hierarchy gaps.
2. Review desktop, tablet, and mobile layouts for overflow, readability, and usable controls.
3. Check semantic structure, keyboard access, focus visibility, accessible labels, contrast, and status indicators that do not rely on color alone.
4. Add restrained pixel-art logo motion only if the referenced asset supports it; respect reduced-motion preferences.
5. Review loading, error, empty, partial, and unavailable states for consistency.

## Testing and verification plan

Run checks incrementally as features land, then repeat the full relevant set before completion. The repository currently provides `pnpm lint` and `pnpm build`; add automated test tooling only when a concrete feature needs it.

1. **Baseline/foundation:** `pnpm lint`, `pnpm build`, and confirm the app starts.
2. **API client:** verify base URL normalization, query/body construction, HTTP errors, and malformed error payload handling.
3. **Telemetry:** exercise each region and success, partial, unavailable, null, stale-cache, loading, error, and retry cases. Confirm units/dates/sources and no fabricated fallback values.
4. **Date exploration:** check future-date rejection and 90-day maximum boundaries, including omitted default parameters.
5. **Map:** verify layer/date/coordinate URL generation, zoom limits, loading/error behavior, and responsive controls.
6. **Advisory:** check all valid/invalid input cases, no request before Evaluate, response errors, null pest score, interpretation labels, rationale, and disclaimer.
7. **End-to-end/browser:** inspect network requests and console output, verify live backend integration, and review the main workflows at desktop and mobile widths.
8. **Accessibility/visual:** keyboard-only navigation, focus states, labels, contrast, reduced motion, and comparison with the relevant Figma screens.
9. **Final:** rerun `pnpm lint` and `pnpm build`; report exactly what ran and any blocked checks.

## Release readiness

- Live telemetry for all supported regions; no production mock measurements or recommendations.
- Correct partial, unavailable, cached, and error handling.
- Working NASA tile map and explicit advisory submission using the documented backend.
- Backend limitations, sources, units, dates, and disclaimer remain visible and accurate.
- Responsive and accessible primary workflows.
- Lint/build pass, with browser/network verification documented for backend-connected features.

