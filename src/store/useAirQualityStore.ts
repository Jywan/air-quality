import { create } from "zustand";
import type { DistrictData } from "@/lib/mockData";

export type Metric = "pm25" | "pm10" | "o3" | "no2" | "co" | "so2";
export type Region = "서울" | "경기" | "인천";

interface AirQualityStore {
    data: DistrictData[];
    isMock: boolean;
    selectedDistrict: string | null;
    selectedMetric: Metric;
    selectedRegion: Region;
    selectedCity: string | null;        // 드릴다운용
    isLoading: boolean;
    updatedAt: string | null;
    setData: (data: DistrictData[], isMock: boolean) => void;
    setSelectedDistrict: (name: string | null) => void;
    setSelectedMetric: (metric: Metric) => void;
    setSelectedRegion: (region: Region) => void;
    setSelectedCity: (city: string | null) => void;
    setLoading: (v: boolean) => void;
}

export const useAirQualityStore = create<AirQualityStore>((set) => ({
    data: [],
    isMock: false,
    selectedDistrict: null,
    selectedMetric: "pm25",
    selectedRegion: "서울",
    selectedCity: null,
    isLoading: false,
    updatedAt: null,
    setData: (data, isMock) =>
        set({ data, isMock, updatedAt: data[0]?.updatedAt ?? null }),
    setSelectedDistrict: (name) => set({ selectedDistrict: name }),
    setSelectedMetric: (metric) => set({ selectedMetric: metric }),
    setSelectedRegion: (region) => set({ selectedRegion: region, selectedDistrict: null, selectedCity: null, data: [] }),
    setSelectedCity: (city) => set({ selectedCity: city, selectedDistrict: null}), 
    setLoading: (v) => set({ isLoading: v }),
}));