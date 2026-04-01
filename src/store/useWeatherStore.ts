import { create } from "zustand";

export type WeatherMetric = "temp" | "humidity" | "windSpeed" | "precipitation";

export interface WeatherData {
    regionName: string;
    temp: number | null;
    humidity: number | null;
    windSpeed: number | null;
    precipitation: number | null;
}

interface WeatherStore {
    data: WeatherData[];
    selectedMetric: WeatherMetric;
    isLoading: boolean;
    updatedAt: string | null;
    setData: (data: WeatherData[]) => void;
    setSelectedMetric: (metric: WeatherMetric) => void;
    setLoading: (v: boolean) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
    data: [],
    selectedMetric: "temp",
    isLoading: false,
    updatedAt: null,
    setData: (data) => set({ data, updatedAt: new Date().toISOString() }),
    setSelectedMetric: (metric) => set({ selectedMetric: metric }),
    setLoading: (v) => set({ isLoading: v }),
}));