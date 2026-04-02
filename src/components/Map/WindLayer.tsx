"use client";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useWeatherStore } from "@/store/useWeatherStore";
import { buildWindGrid } from "@/lib/windGrid";

export default function WindLayer() {
    const map = useMap();
    const { data, selectedMetric } = useWeatherStore();
    const layerRef = useRef<any>(null);

    useEffect(() => {
        try { layerRef.current?.remove(); } catch {}
        layerRef.current = null;

        if (selectedMetric !== "windDir" || !data.length) return;

        const windData = buildWindGrid(data);
        if (!windData) return;

        let cancelled = false;

        (async () => {
            const L = (await import("leaflet")).default;
            await import("leaflet-velocity");

            if (cancelled || !(L as any).velocityLayer) return;

            layerRef.current = (L as any).velocityLayer({
                displayValues: true,
                displayOptions: {
                    velocityType: "풍속",
                    displayPosition: "bottomleft",
                    displayEmptyString: "데이터 없음",
                    speedUnit: "m/s",
                },
                data: windData,
                maxVelocity: 8,
                minVelocity: 0,
                velocityScale: 0.015,
                particleMultiplier: 0.015,
                lineWidth: 1.5,
                colorScale: [
                    "#67e8f9",  // 사이언
                    "#22d3ee",  // 밝은 청록
                    "#06b6d4",  // 청록
                    "#0891b2",  // 진한 청록
                    "#0e7490",  // 딥 청록
                    "#155e75",  // 다크 청록
                ],
                frameRate: 15,
                particleAge: 64,
            }).addTo(map);
        })();

        return () => {
            cancelled = true;
            try { layerRef.current?.remove(); } catch {}
            layerRef.current = null;
        };
    }, [data, selectedMetric, map]);

    return null;
}
