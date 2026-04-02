import { useEffect, useCallback } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";

export function useWeather() {
    const { setData, setLoading, selectedRegion, selectedCity } = useWeatherStore();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ sido: selectedRegion });
            if (selectedCity) params.append("city", selectedCity);
            const res = await fetch(`/api/weather?${params}`);
            const json = await res.json();
            if (json.data) setData(json.data);
        } finally {
            setLoading(false);
        }
    }, [selectedRegion, selectedCity, setData, setLoading]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);
}