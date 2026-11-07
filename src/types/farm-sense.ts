export const REGIONS = [
  { id: "ayeyarwady", label: "Ayeyarwady Delta" },
  { id: "central_dry_zone", label: "Central Dry Zone" },
  { id: "shan_highlands", label: "Shan Highlands" },
  { id: "coastal_rakhine", label: "Coastal Rakhine" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];
export type SoilType = "sandy_loam" | "loam" | "clay" | "silt" | "unknown";
export type Season = "monsoon" | "dry" | "cool";

export interface TelemetryMetric {
  value_percentage?: number | null;
  celsius?: number | null;
  anomaly?: number | null;
  index_value?: number | null;
  precipitation_mm_day?: number | null;
  monthly_anomaly_percentage?: number | null;
  status?: string | null;
  source?: string | null;
  measurement_type?: string | null;
  observation_date?: string | null;
  observation_start?: string | null;
  observation_end?: string | null;
  quality?: string | null;
  stale_cache?: boolean | null;
}

export interface TelemetryResponse {
  status: "success" | "partial" | "unavailable" | string;
  region: string;
  region_id: RegionId;
  timestamp?: string;
  sample_location?: {
    latitude: number;
    longitude: number;
    method?: string;
  } | null;
  telemetry?: {
    soil_moisture?: TelemetryMetric | null;
    land_surface_temp?: TelemetryMetric | null;
    vegetation_health_ndvi?: TelemetryMetric | null;
    rainfall?: TelemetryMetric | null;
  } | null;
  limitations?: string[];
  error?: string;
  stale_cache?: boolean;
}

export interface AdvisoryRequest {
  region_id: RegionId;
  soil_type: SoilType;
  current_crop: string;
  target_season: Season;
}

