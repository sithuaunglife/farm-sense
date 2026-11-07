"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { evaluateAdvisory } from "@/services/farm-sense-api";
import { REGIONS, type AdvisoryRequest, type RegionId } from "@/types/farm-sense";

const advisorySchema = z.object({
  region_id: z.enum(["ayeyarwady", "central_dry_zone", "shan_highlands", "coastal_rakhine"]),
  soil_type: z.enum(["sandy_loam", "loam", "clay", "silt", "unknown"]),
  current_crop: z.string().trim().min(1, "Enter the crop currently grown.").max(40, "Crop name must be 40 characters or fewer."),
  target_season: z.enum(["monsoon", "dry", "cool"]),
});

function labelFor(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b(ndvi|NASA|SMAP|LST)\b/gi, (match) => match.toUpperCase())
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function findDisclaimer(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDisclaimer(item);
      if (found) return found;
    }
    return null;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key.toLowerCase().includes("disclaimer") && typeof child === "string") return child;
    const found = findDisclaimer(child);
    if (found) return found;
  }
  return null;
}

function ResultValue({ name, value }: { name: string; value: unknown }) {
  const cleanName = name.toLowerCase();
  if (cleanName.includes("disclaimer")) return null;
  if (value === null || value === undefined || value === "") {
    return <div className="result-row"><dt>{labelFor(name)}</dt><dd>Not provided</dd></div>;
  }
  if (typeof value === "boolean") {
    const explanation = name === "forecast_based" && !value ? "No: this guidance is not a weather forecast." : value ? "Yes" : "No";
    return <div className="result-row"><dt>{labelFor(name)}</dt><dd>{explanation}</dd></div>;
  }
  if (typeof value === "number" || typeof value === "string") {
    const shown = typeof value === "number" ? `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${cleanName.includes("percentage") ? "%" : ""}` : value;
    return <div className="result-row"><dt>{labelFor(name)}</dt><dd>{shown}</dd></div>;
  }
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item !== "object" || item === null)) {
      return <div className="result-row result-array"><dt>{labelFor(name)}</dt><dd>{value.length ? value.map((item, index) => <span className="tag" key={`${name}-${index}`}>{String(item)}</span>) : "None provided"}</dd></div>;
    }
    return <div className="result-nested" key={name}><h4>{labelFor(name)}</h4>{value.map((item, index) => <ResultValue name={`Option ${index + 1}`} value={item} key={`${name}-${index}`} />)}</div>;
  }
  return <div className="result-nested" key={name}><h4>{labelFor(name)}</h4><dl>{Object.entries(value as Record<string, unknown>).map(([childName, child]) => <ResultValue name={childName} value={child} key={childName} />)}</dl></div>;
}

export function AdvisoryPanel({ regionId }: { regionId: RegionId }) {
  const [result, setResult] = useState<unknown>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [evaluated, setEvaluated] = useState(false);
  const disclaimer = useMemo(() => findDisclaimer(result), [result]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdvisoryRequest>({
    resolver: zodResolver(advisorySchema),
    defaultValues: { region_id: regionId, soil_type: "unknown", current_crop: "", target_season: "monsoon" },
  });

  const onSubmit = async (payload: AdvisoryRequest) => {
    setRequestError(null);
    setResult(null);
    setEvaluated(false);
    try {
      const response = await evaluateAdvisory(payload);
      setResult(response);
      setEvaluated(true);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Could not evaluate the advisory. Try again.");
    }
  };

  return (
    <section className="panel advisory-panel" id="advisory" aria-labelledby="advisory-title">
      <div className="panel-heading">
        <div><p className="eyebrow">Farm decision workspace</p><h2 id="advisory-title">Agricultural advisory</h2></div>
        <span className="panel-index">03 / EVALUATE</span>
      </div>
      <p className="section-copy">Share your field context to request recommendations from the Farm Sense backend.</p>
      <form className="advisory-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>Region<select {...register("region_id")} aria-invalid={!!errors.region_id}>{REGIONS.map((region) => <option value={region.id} key={region.id}>{region.label}</option>)}</select>{errors.region_id && <span className="field-error">{errors.region_id.message}</span>}</label>
        <label>Soil type<select {...register("soil_type")} aria-invalid={!!errors.soil_type}><option value="unknown">Unknown</option><option value="sandy_loam">Sandy loam</option><option value="loam">Loam</option><option value="clay">Clay</option><option value="silt">Silt</option></select>{errors.soil_type && <span className="field-error">{errors.soil_type.message}</span>}</label>
        <label>Current crop<input {...register("current_crop")} maxLength={40} placeholder="e.g. rice" aria-invalid={!!errors.current_crop} />{errors.current_crop && <span className="field-error">{errors.current_crop.message}</span>}</label>
        <label>Target season<select {...register("target_season")}><option value="monsoon">Monsoon</option><option value="dry">Dry</option><option value="cool">Cool</option></select></label>
        <button className="pixel-button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Evaluating…" : "Evaluate advisory"}<span aria-hidden="true">↗</span></button>
      </form>
      {requestError && <div className="inline-alert error-alert" role="alert"><strong>Evaluation failed.</strong> {requestError}</div>}
      {evaluated && result !== null && <div className="advisory-results" aria-live="polite">
        <div className="results-heading"><div><p className="eyebrow">Backend response</p><h3>Recommendations</h3></div><span className="live-tag">LIVE RESULT</span></div>
        {result && typeof result === "object" && !Array.isArray(result) ? <div className="result-grid">{Object.entries(result as Record<string, unknown>).filter(([key]) => !key.toLowerCase().includes("disclaimer")).map(([key, value]) => <section className="result-card" key={key}><h4>{labelFor(key)}</h4><dl><ResultValue name={key} value={value} /></dl></section>)}</div> : <pre className="raw-response">{JSON.stringify(result, null, 2)}</pre>}
        <div className="disclaimer-box"><strong>Backend disclaimer</strong><p>{disclaimer ?? "The backend response did not include a disclaimer field."}</p></div>
      </div>}
      {!evaluated && !requestError && <p className="form-note">Recommendations are evaluated only when you submit this form. Results depend on the information provided and available backend data.</p>}
    </section>
  );
}

