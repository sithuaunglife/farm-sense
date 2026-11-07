"use client";

import useSWR from "swr";
import { fetchTelemetry } from "@/services/farm-sense-api";
import type { RegionId } from "@/types/farm-sense";

export function useTelemetry(regionId: RegionId, startDate?: string, endDate?: string) {
  const key = ["telemetry", regionId, startDate || "", endDate || ""] as const;
  return useSWR(key, ([, region, start, end]) => fetchTelemetry(region, undefined, start || undefined, end || undefined), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

