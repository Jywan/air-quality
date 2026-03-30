import { create } from "zustand";
import type { DistrictData } from "@/lib/mockData";

export type Metric = "pm25" | "pm10" | "o3";

interface AirQualityStore {
    data: DistrictData[];
    isMock: boolean;
    selectedDistrict: string | null;
    selectedMetric: Metric;
    isLoading: boolean;
    updatedAt: string | null;
    setData: (data: DistrictData[], isMock: boolean) => void;
    setSelectedDistrict: (name: string | null) => void;
    setSelectedMetric: (metric: Metric) => void;
    setLoading: (v: boolean) => void;
}

export const useAirQualityStore = create<AirQualityStore>((set) => ({
    data: [],
    isMock: false,
    selectedDistrict: null,
    selectedMetric: "pm25",
    isLoading: false,
    updatedAt: null,
    setData: (data, isMock) =>
        set({ data, isMock, updatedAt: data[0]?.updatedAt ?? null }),
    setSelectedDistrict: (name) => set({ selectedDistrict: name }),
    setSelectedMetric: (metric) => set({ selectedMetric: metric }),
    setLoading: (v) => set({ isLoading: v }),
}));