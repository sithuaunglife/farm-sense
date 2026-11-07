# Testing and verification

## Current state

The repository currently defines `lint` and `build` scripts but no dedicated unit, integration, or browser-test scripts. Do not assume tests exist because a feature is documented. Add a test framework only when the feature/task justifies it and keep setup aligned with the repository's stack.

## Available checks

```bash
pnpm lint
pnpm build
```

For a UI change, also run `pnpm dev` and inspect the affected experience at desktop and mobile widths when visual verification is part of the task. Check browser console and network requests for API-backed changes. Do not claim manual or automated checks that were not performed.

## Feature verification checklist

### Telemetry

- Selecting each supported region requests its live telemetry.
- Custom dates are valid, non-future, and at most 90 days; no date query is sent when the backend default is intended.
- Success, partial, unavailable, null metric, stale cache, loading, error, and retry states are distinguishable.
- Values retain backend units, dates, and sources. Missing values never display as zero.
- Representative points and data limitations are clearly explained.

### Advisory

- Invalid region, soil type, season, empty crop, and crop longer than 40 characters are rejected before request.
- No evaluation request occurs until the user clicks Evaluate.
- Loading and error states work; results include rationale and backend disclaimer.
- Null pest screening score is handled; score is not described as probability.
- Irrigation is not described as a forecast when `forecast_based` is false.

### Map and accessibility

- Terra and Aqua tiles use the configured base URL, selected past/observation date, Web Mercator `{z}/{x}/{y}`, and supported zoom 0–9.
- Imagery date and layer are visible; copy does not claim exact ground-level measurement.
- Keyboard interaction, focus visibility, accessible labels, contrast, reduced motion, and responsive layout are checked.

## Reporting

Report the command or manual check, outcome, and any limitation. If a check cannot run because configuration or backend access is unavailable, state that explicitly rather than substituting invented data or a passing result.

