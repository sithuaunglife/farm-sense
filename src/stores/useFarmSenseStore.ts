"use client";

import { create } from "zustand";
import type { RegionId } from "@/types/farm-sense";

interface FarmSenseState {
  selectedRegion: RegionId;
  setSelectedRegion: (region: RegionId) => void;
}

export const useFarmSenseStore = create<FarmSenseState>((set) => ({
  selectedRegion: "ayeyarwady",
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
}));

