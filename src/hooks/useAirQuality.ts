import { useEffect } from "react";
import { useAirQualityStore } from "@/store/useAirQualityStore";

export function useAirQuality() {
    const { setData, setLoading } = useAirQualityStore();

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/air-quality')
            const { data, isMock } = await res.json()
            setData(data, isMock)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30 * 60* 1000); //30분
        return () => clearInterval(interval);
    }, []);
}