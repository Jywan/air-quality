import { useEffect, useCallback } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";

export function useWeather() {
    const { setData, setLoading } = useWeatherStore();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/weather");
            const json = await res.json();
            if (json.data) setData(json.data);
        } finally {
            setLoading(false);
        }
    }, [setData, setLoading]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);
}