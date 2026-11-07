"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CloudRain, Droplets, Leaf, MapPin, RefreshCw, Satellite, ThermometerSun, Sprout, Waves } from "lucide-react";
import { AdvisoryPanel } from "@/features/farm-sense/advisory-panel";
import { useTelemetry } from "@/features/farm-sense/use-telemetry";
import { useFarmSenseStore } from "@/stores/useFarmSenseStore";
import { REGIONS, type RegionId, type TelemetryMetric } from "@/types/farm-sense";

const SatelliteMap = dynamic(() => import("@/features/farm-sense/satellite-map"), {
  ssr: false,
  loading: () => <div className="map-loading">Preparing satellite map…</div>,
});

const METRICS = [
  { key: "soil_moisture", name: "Soil moisture", detail: "Surface wetness indicator", icon: Droplets, value: (metric: TelemetryMetric) => metric.value_percentage, unit: "%" },
  { key: "land_surface_temp", name: "Land surface temperature", detail: "Satellite surface temperature", icon: ThermometerSun, value: (metric: TelemetryMetric) => metric.celsius, unit: "°C" },
  { key: "vegetation_health_ndvi", name: "Vegetation health", detail: "Normalized Difference Vegetation Index", icon: Sprout, value: (metric: TelemetryMetric) => metric.index_value, unit: "NDVI" },
  { key: "rainfall", name: "Rainfall", detail: "Period daily mean", icon: CloudRain, value: (metric: TelemetryMetric) => metric.precipitation_mm_day, unit: "mm/day" },
] as const;

function displayDate(date?: string | null) {
  if (!date) return "Date unavailable";
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function formatRequestTime(timestamp?: string) {
  if (!timestamp) return null;
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function todayInput() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function metricDate(metric?: TelemetryMetric | null) {
  return metric?.observation_date ?? metric?.observation_end ?? null;
}

function mostRecentObservation(metrics: TelemetryMetric[]) {
  return metrics.map(metricDate).filter((date): date is string => !!date).sort().at(-1) ?? null;
}

function readableStatus(status?: string | null) {
  if (!status) return "Status unavailable";
  return status.replace(/_/g, " ");
}

function MetricCard({ item, metric }: { item: (typeof METRICS)[number]; metric?: TelemetryMetric | null }) {
  const Icon = item.icon;
  const value = metric ? item.value(metric) : null;
  const isAvailable = typeof value === "number" && Number.isFinite(value);
  const shown = isAvailable
    ? `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${item.unit}`
    : "Data unavailable";
  return (
    <article className="metric-card">
      <div className="metric-heading"><span className="metric-icon"><Icon size={15} aria-hidden="true" /></span><span className="metric-status">{isAvailable ? readableStatus(metric?.status) : "Unavailable"}</span></div>
      <p className="metric-name">{item.name}</p>
      <p className={`metric-value ${isAvailable ? "" : "unavailable-value"}`}>{shown}</p>
      <p className="metric-detail">{item.detail}</p>
      <div className="metric-foot"><span>{displayDate(metricDate(metric))}</span>{metric?.stale_cache && <span className="cache-badge">Cached</span>}</div>
      <p className="metric-source">{metric?.source ?? "Source unavailable"}</p>
    </article>
  );
}

function RegionSelector({ selected, onChange }: { selected: RegionId; onChange: (id: RegionId) => void }) {
  return (
    <section className="panel region-panel" aria-labelledby="region-title">
      <div className="panel-heading compact-heading"><div><p className="eyebrow">Myanmar regions</p><h2 id="region-title">Select your area</h2></div><span className="region-count">04</span></div>
      <div className="region-list">
        {REGIONS.map((region, index) => (
          <button className={`region-option ${selected === region.id ? "selected" : ""}`} key={region.id} onClick={() => onChange(region.id)} aria-pressed={selected === region.id}>
            <span className="region-code">0{index + 1}</span><span className="region-name">{region.label}</span><span className="region-caret" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <div className="region-context"><MapPin size={14} /><span>Regional measurements use a representative sample point.</span></div>
    </section>
  );
}

function Exploration({ activeRange, onApply }: { activeRange: { start: string; end: string } | null; onApply: (range: { start: string; end: string } | null) => void }) {
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);

  const applyRange = () => {
    setRangeError(null);
    if (!draftStart || !draftEnd) {
      setRangeError("Choose both a start and end date.");
      return;
    }
    if (draftStart > draftEnd) {
      setRangeError("Start date must be on or before the end date.");
      return;
    }
    if (draftEnd > todayInput()) {
      setRangeError("Future dates are not available.");
      return;
    }
    const dayCount = (Date.parse(`${draftEnd}T00:00:00Z`) - Date.parse(`${draftStart}T00:00:00Z`)) / 86_400_000;
    if (dayCount > 90) {
      setRangeError("Choose a date range of 90 days or fewer.");
      return;
    }
    onApply({ start: draftStart, end: draftEnd });
  };

  const clearRange = () => {
    setDraftStart("");
    setDraftEnd("");
    onApply(null);
    setRangeError(null);
  };

  return (
    <div className="exploration-controls">
      <div className="date-inputs">
        <label>From<input type="date" value={draftStart} max={todayInput()} onChange={(event) => setDraftStart(event.target.value)} /></label>
        <label>To<input type="date" value={draftEnd} max={todayInput()} onChange={(event) => setDraftEnd(event.target.value)} /></label>
      </div>
      <div className="range-actions"><button className="pixel-button small-button" onClick={applyRange}>Apply range</button>{activeRange && <button className="text-button" onClick={clearRange}>Use default dates</button>}</div>
      {rangeError && <p className="field-error" role="alert">{rangeError}</p>}
      <p className="form-note">{activeRange ? `Showing ${displayDate(activeRange.start)} – ${displayDate(activeRange.end)}` : "Using date range selected by the data service."}</p>
    </div>
  );
}

export function FarmSenseDashboard() {
  const selectedRegion = useFarmSenseStore((state) => state.selectedRegion);
  const setSelectedRegion = useFarmSenseStore((state) => state.setSelectedRegion);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const [mapLayer, setMapLayer] = useState<"true_color_terra" | "true_color_aqua">("true_color_terra");
  const { data, error, isLoading, isValidating, mutate } = useTelemetry(selectedRegion, range?.start, range?.end);

  const metricValues = data?.telemetry;
  const metrics = metricValues ? [metricValues.soil_moisture, metricValues.land_surface_temp, metricValues.vegetation_health_ndvi, metricValues.rainfall].filter((metric): metric is TelemetryMetric => !!metric) : [];
  const imageDate = mostRecentObservation(metrics);
  const regionName = data?.region ?? REGIONS.find((region) => region.id === selectedRegion)?.label ?? "Myanmar";
  const center = data?.sample_location ? [data.sample_location.latitude, data.sample_location.longitude] as [number, number] : null;
  const requestTime = formatRequestTime(data?.timestamp);

  const setDateRange = (next: { start: string; end: string } | null) => setRange(next);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Farm Sense home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
          <span className="brand-copy"><span className="brand-kicker">NASA DATA INSPIRED <i>●</i> MYANMAR</span><strong>FARM SENSE</strong><small>Earth observation for farming decisions</small></span>
        </a>
        <div className="topbar-status"><span className="live-dot" aria-hidden="true" />LIVE DATA WORKSPACE</div>
        <a className="topbar-link" href="#about">ABOUT THE DATA <span aria-hidden="true">↗</span></a>
      </header>

      <nav className="section-nav" aria-label="Dashboard sections">
        <a className="active" href="#overview">01 <span>Overview</span></a>
        <a href="#map">02 <span>Satellite map</span></a>
        <a href="#advisory">03 <span>Advisory</span></a>
        <a href="#explore">04 <span>Explore data</span></a>
      </nav>

      <div className="dashboard-layout" id="top">
        <aside className="sidebar">
          <RegionSelector selected={selectedRegion} onChange={(id) => { setSelectedRegion(id); setDateRange(null); }} />
          <section className="panel sidebar-note" id="about">
            <div className="note-icon"><Satellite size={16} /></div><p className="eyebrow">Earth observation</p><h2>See the signals behind a season.</h2>
            <p>Satellite and environmental datasets provide useful context. They are one part of a local farming decision.</p>
            <a href="#about-data">How to read this data <span aria-hidden="true">→</span></a>
          </section>
          <div className="sidebar-foot"><span>FIELD SENSE / MM</span><span>V 1.0</span></div>
        </aside>

        <section className="main-content" id="overview">
          <div className="page-heading">
            <div><p className="eyebrow">FIELD OBSERVATION / {selectedRegion.replace(/_/g, " ").toUpperCase()}</p><h1>{regionName}<span className="heading-mark">✳</span></h1><p className="page-subtitle">Environmental conditions from NASA Earth observation datasets.</p></div>
            <div className="updated-block"><span className="updated-label">{isValidating ? "UPDATING DATA" : "LATEST RESPONSE"}</span><strong>{requestTime ?? "Awaiting observation"}</strong><button className="refresh-button" onClick={() => void mutate()} aria-label="Refresh telemetry"><RefreshCw size={14} className={isValidating ? "spin" : ""} /> Refresh</button></div>
          </div>

          {error && <div className="inline-alert error-alert" role="alert"><div><strong>Telemetry could not be refreshed.</strong> {error.message}</div><button className="text-button" onClick={() => void mutate()}>Retry</button></div>}
          {data?.status === "partial" && <div className="inline-alert partial-alert"><strong>Partial data available.</strong> Some measurements may be missing for this region.</div>}
          {data?.status === "unavailable" && <div className="inline-alert error-alert"><strong>Data unavailable for this request.</strong> No measurements are shown until the service returns them.</div>}
          {data?.stale_cache && <div className="inline-alert cache-alert"><strong>Cached response.</strong> The service returned previously cached data.</div>}

          <section className="metrics-section" aria-labelledby="metrics-title">
            <div className="section-heading"><div><p className="eyebrow">CURRENT INDICATORS</p><h2 id="metrics-title">Regional telemetry</h2></div><span className="source-label">4 MEASURES / {data?.status?.toUpperCase() ?? "CONNECTING"}</span></div>
              {isLoading && !data ? <div className="metric-grid">{METRICS.map((metric) => <div className="metric-skeleton" key={metric.key} aria-label={`Loading ${metric.name}`}><span /><span /><span /></div>)}</div> : <div className="metric-grid">{METRICS.map((item) => <MetricCard item={item} metric={data?.status === "unavailable" ? undefined : metricValues?.[item.key]} key={item.key} />)}</div>}
          </section>

          <section className="panel map-panel" id="map" aria-labelledby="map-title">
            <div className="panel-heading map-heading">
              <div><p className="eyebrow">NASA OBSERVATION EXPLORER</p><h2 id="map-title">Satellite view <span className="heading-mark">✳</span></h2></div>
              <div className="map-tools"><div className="layer-switch" role="group" aria-label="Satellite layer"><button className={mapLayer === "true_color_terra" ? "selected" : ""} onClick={() => setMapLayer("true_color_terra")}>TERRA</button><button className={mapLayer === "true_color_aqua" ? "selected" : ""} onClick={() => setMapLayer("true_color_aqua")}>AQUA</button></div><span className="imagery-date">{imageDate ? displayDate(imageDate) : "DATE UNAVAILABLE"}</span></div>
            </div>
            <div className="map-frame">
              {center && imageDate ? <SatelliteMap key={`${selectedRegion}-${imageDate}-${mapLayer}`} center={center} date={imageDate.slice(0, 10)} layer={mapLayer} label={regionName} /> : <div className="map-empty"><Satellite size={28} /><strong>{isLoading ? "Loading regional imagery" : "Imagery unavailable"}</strong><span>{isLoading ? "Waiting for a telemetry observation date and sample point." : "A valid observation date and representative sample point are needed to request imagery."}</span></div>}
              <div className="map-overlay"><span className="map-coord">{center ? `${center[0].toFixed(3)}° N / ${center[1].toFixed(3)}° E` : "MYANMAR"}</span><span className="map-caption"><i /> {mapLayer === "true_color_terra" ? "TERRA TRUE COLOR" : "AQUA TRUE COLOR"}</span></div>
            </div>
            <div className="map-footer"><div><span className="map-pin"><MapPin size={14} /></span><p><strong>Representative sample point</strong><small>Point location only; this is not a regional average.</small></p></div><p className="map-disclaimer">Satellite imagery provides regional context, not exact ground-level measurements.</p></div>
          </section>

          <section className="panel exploration-panel" id="explore" aria-labelledby="explore-title">
            <div className="panel-heading"><div><p className="eyebrow">TELEMETRY HISTORY</p><h2 id="explore-title">Explore a date range</h2></div><span className="panel-index">04 / DATA</span></div>
            <p className="section-copy">Request a past period to compare available environmental observations. Custom ranges are limited to 90 days.</p>
            <Exploration key={selectedRegion} onApply={setDateRange} activeRange={range} />
          </section>

          <div className="advisory-anchor"><AdvisoryPanel key={selectedRegion} regionId={selectedRegion} /></div>

          <section className="panel about-data-panel" id="about-data" aria-labelledby="about-data-title">
            <div className="panel-heading"><div><p className="eyebrow">READING THE SIGNALS</p><h2 id="about-data-title">What these measurements tell us</h2></div><span className="panel-index">FIELD NOTES</span></div>
            <div className="education-grid">
              <article><Droplets size={15} /><h3>Soil moisture</h3><p>Surface wetness context. The percentage shown is not SMAP volumetric soil moisture.</p></article>
              <article><ThermometerSun size={15} /><h3>Land surface temperature</h3><p>Temperature observed at the land surface. It is different from the air temperature.</p></article>
              <article><Leaf size={15} /><h3>Vegetation health · NDVI</h3><p>A vegetation index derived from reflected light. It does not identify a crop by itself.</p></article>
              <article><Waves size={15} /><h3>Rainfall</h3><p>Rainfall context over the observation period. It should not be read as a future forecast.</p></article>
            </div>
            {data?.limitations && data.limitations.length > 0 && <div className="limitations"><h3>Data limitations for this response</h3><ul>{data.limitations.map((limitation, index) => <li key={`${index}-${limitation}`}>{limitation}</li>)}</ul></div>}
            <p className="source-footnote">Data sources and observation dates are provided per measure. Composite satellite products describe observation periods, not forecasts.</p>
          </section>

          <footer className="page-footer"><span>FARM SENSE · MYANMAR</span><span>EARTH OBSERVATION FOR FARMING DECISIONS</span><span>Built for clear context.</span></footer>
        </section>
      </div>
    </main>
  );
}

