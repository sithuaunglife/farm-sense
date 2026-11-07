import type { AdvisoryRequest, RegionId, TelemetryResponse } from "@/types/farm-sense";

const DEFAULT_API_BASE_URL =
  "https://fieldshiftadaptingfarmswithnasadatabackend-production.up.railway.app";

export function apiUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  return `${base}/${path.replace(/^\/+/, "")}`;
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const message = [record.message, record.detail, record.error]
      .find((value) => typeof value === "string" && value.trim());
    throw new Error(message ? String(message) : `Request failed (${response.status})`);
  }
  return payload as T;
}

export async function fetchTelemetry(regionId: RegionId, signal?: AbortSignal, startDate?: string, endDate?: string) {
  const url = new URL(apiUrl(`/api/v1/telemetry/region/${regionId}`));
  if (startDate && endDate) {
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
  }
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Could not reach the telemetry API. Check network access and whether the backend allows this frontend origin (CORS).");
    }
    throw error;
  }
  return readResponse<TelemetryResponse>(response);
}

export async function evaluateAdvisory(payload: AdvisoryRequest) {
  let response: Response;
  try {
    response = await fetch(apiUrl("/api/v1/advisory/evaluate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Could not reach the advisory API. Check network access and whether the backend allows this frontend origin (CORS).");
    }
    throw error;
  }
  return readResponse<unknown>(response);
}

