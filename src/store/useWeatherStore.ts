import { create } from "zustand";
import type { Region } from "@/store/useAirQualityStore";

export type WeatherMetric = "temp" | "humidity" | "windSpeed" | "windDir" | "precipitation";
export type { Region };

export interface WeatherData {
    districtName: string;
    lat: number | null;
    lon: number | null;
    temp: number | null;
    humidity: number | null;
    windSpeed: number | null;
    windDir: number | null;
    precipitation: number | null;
}

interface WeatherStore {
    data: WeatherData[];
    selectedMetric: WeatherMetric;
    selectedRegion: Region;
    selectedCity: string | null;
    selectedDistrict: string | null;
    isLoading: boolean;
    updatedAt: string | null;
    setData: (data: WeatherData[]) => void;
    setSelectedMetric: (metric: WeatherMetric) => void;
    setSelectedRegion: (region: Region) => void;
    setSelectedCity: (city: string | null) => void;
    setSelectedDistrict: (district: string | null) => void;
    setLoading: (v: boolean) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
    data: [],
    selectedMetric: "temp",
    selectedRegion: "전국",
    selectedCity: null,
    selectedDistrict: null,
    isLoading: false,
    updatedAt: null,
    setData: (data) => set({ data, updatedAt: new Date().toISOString() }),
    setSelectedMetric: (metric) => set({ selectedMetric: metric }),
    setSelectedRegion: (region) => set({ selectedRegion: region, selectedCity: null, selectedDistrict: null, data: [] }),
    setSelectedCity: (city) => set({ selectedCity: city, selectedDistrict: null, data: [] }),
    setSelectedDistrict: (district) => set({ selectedDistrict: district }),
    setLoading: (v) => set({ isLoading: v }),
}));
