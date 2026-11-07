# Product requirements

This guide condenses the product contract in [`../product.txt`](../product.txt). The source file remains the fuller reference; update both when product requirements change.

## Vision and audience

Farm Sense helps farmers and agriculture-focused users in Myanmar understand environmental conditions and explore information that supports farming decisions. Present scientific Earth observation data in clear, practical language. The visual direction is a readable, modern agricultural dashboard with a restrained pixel-art identity, based on the [Farm Sense Figma reference](https://www.figma.com/design/lLVm7B5Sn94vhRLV7xV5fU/farm?node-id=0-1). The reference is currently exposed as grouped raster layers, so inspect the intended screen before deriving detailed layout or token rules.

## Main experience

- **Dashboard:** overview of the selected region, with soil moisture, land surface temperature, vegetation health (NDVI), and rainfall. Show units, observation dates, source, status, and data limitations. Mark cached data clearly.
- **Interactive map:** select a supported region and view Terra or Aqua true-color NASA imagery. Show imagery date, layer, and controls. Label representative sample locations accurately; do not imply imagery is a ground measurement.
- **Agricultural advisory:** collect region, soil type, current crop, and target season. Validate before sending and evaluate only on explicit user action. Present irrigation guidance, pest screening score and confidence, crop-rotation options and suitability, backend rationale, and backend disclaimer.
- **Data exploration:** explore available regional telemetry with date ranges accepted by the backend; make dates, sources, and limitations clear.
- **Educational context:** briefly explain soil moisture, land surface temperature, NDVI, and rainfall and why they matter to agriculture.

## Supported regions and inputs

| Region ID | Region |
| --- | --- |
| `ayeyarwady` | Ayeyarwady |
| `central_dry_zone` | Central Dry Zone |
| `shan_highlands` | Shan Highlands |
| `coastal_rakhine` | Coastal Rakhine |

Advisory `soil_type`: `sandy_loam`, `loam`, `clay`, `silt`, or `unknown`. `current_crop` is required and at most 40 characters. `target_season`: `monsoon`, `dry`, or `cool`.

## Backend contract

Base URL (override with `NEXT_PUBLIC_API_BASE_URL`):

```text
https://fieldshiftadaptingfarmswithnasadatabackend-production.up.railway.app
```

### Regional telemetry

```http
GET /api/v1/telemetry/region/{region_id}?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Date parameters are optional; allow the backend to choose defaults when omitted. A custom range must not exceed 90 days or include future dates. Fetch again when the selected region or range changes. Display soil moisture, land surface temperature, NDVI, and rainfall with backend-provided values, units, observation dates, sources, and status. Support `success`, `partial`, and `unavailable`; render available metrics in partial responses. Show “Data unavailable” for null/unavailable metrics, never zero. Clearly identify `stale_cache=true`; include loading, error, and retry states.

Interpretation constraints:

- `sample_location` is a representative point, not a regional average.
- Do not label `surface_wetness_fraction` as SMAP volumetric soil moisture.
- `land_surface_temp.anomaly` may be null.
- Do not claim CMR granule IDs identify the exact source for each metric.

### Advisory evaluation

```http
POST /api/v1/advisory/evaluate
Content-Type: application/json
```

Request fields: `region_id`, `soil_type`, `current_crop`, `target_season` as described above. Use React Hook Form and Zod, validate client-side, and submit only when Evaluate is clicked. Render request loading and errors. Display irrigation recommendation and urgency, pest screening score and confidence, crop-rotation suggestions and suitability, backend rationale, and always the backend disclaimer. A null pest score needs an unavailable state. Label `pest_risk.score_percentage` as a screening score, not a measured probability. When `irrigation.forecast_based=false`, do not call it a forecast or next-48-hour prediction.

### NASA map tiles

```http
GET /api/v1/tiles/{layer}/{date}/{z}/{x}/{y}.jpg
```

Layers: `true_color_terra`, `true_color_aqua`. Use the map library tile URL template, configured API base URL, Web Mercator coordinates, and zoom levels 0–9. Use a telemetry observation date or a user-selected past date. Display the imagery date and layer and explain that imagery is not an exact ground-level measurement.

## Data integrity

- Use only NASA-related information and recommendations supplied by the production backend. Never fabricate measurements, history, forecasts, advisories, or values to fill gaps.
- Keep backend units, observation dates, source labels, statuses, uncertainty, and limitations intact.
- Distinguish observed data, imagery, user-provided inputs, and advisory interpretation.
- Never turn a sample point into a regional average, a screening score into probability, or a non-forecast recommendation into a weather forecast.
- Keep secrets and NASA Earthdata tokens out of browser code. Do not modify backend code.

## Quality attributes

The UI should be responsive, lightweight, readable, keyboard accessible, and have sufficient contrast. Do not use color alone for status. Respect reduced-motion settings, including any subtle pixel-style Field Share logo animation. Give meaningful loading, error, partial, unavailable, and empty states, with retry where useful. Explain science terms in concise, plain language.

