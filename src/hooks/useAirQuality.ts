import { useEffect, useCallback } from "react";
import { useAirQualityStore } from "@/store/useAirQualityStore";

const SIDO_PARAM: Record<string, string> = {
    "서울": "서울",
    "경기": "경기",
    "인천": "인천",
}


export function useAirQuality() {
    const { setData, setLoading, selectedRegion } = useAirQualityStore();

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const sido = SIDO_PARAM[selectedRegion];
            const res = await fetch(`/api/air-quality?sido=${encodeURIComponent(sido)}`);
            const { data, isMock } = await res.json();
            setData(data, isMock);
        } finally {
            setLoading(false)
        }
    }, [selectedRegion, setData, setLoading]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30 * 60* 1000); //30분
        return () => clearInterval(interval);
    }, [fetchData]);
}