import { create } from "zustand";

type Metric = 'pm25' | 'pm10' | 'o3'

interface DistrictData {
    districtName: string
    pm25: number
    pm10: number
    o3: number
    updatedAt: string
}

interface AirQualityStore {
    data: DistrictData[]
    selectedDistrict: string | null
    selectedMetric: Metric
    isLoading: boolean
    setData: (data: DistrictData[]) => void
    setSelectedDistrict: (name: string | null) => void
    setSelectedMetric: (metric: Metric) => void
    setLoading: (v: boolean) => void
}

export const useAirQualityStore = create<AirQualityStore>((set) => ({
    data: [],
    selectedDistrict: null,
    selectedMetric: 'pm25',
    isLoading: false,
    setData: (data) => set({ data }),
    setSelectedDistrict: (name) => set({ selectedDistrict: name }),
    setSelectedMetric: (metric) => set({ selectedMetric: metric }),
    setLoading: (v) => set({ isLoading: v }),
}))