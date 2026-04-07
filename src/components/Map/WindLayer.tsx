"use client";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useWeatherStore } from "@/store/useWeatherStore";
import { buildWindGrid } from "@/lib/windGrid";

const BASE_ZOOM = 7;
const BASE_VELOCITY_SCALE = 0.015;

export default function WindLayer() {
    const map = useMap();
    const { data, selectedMetric, selectedRegion } = useWeatherStore();
    const layerRef = useRef<any>(null);
    const zoomRef = useRef<number>(map.getZoom());

    useEffect(() => {
        const onZoom = () => { zoomRef.current = map.getZoom(); };
        map.on("zoomend", onZoom);
        return () => { map.off("zoomend", onZoom); };
    }, [map]);

    useEffect(() => {
        try { layerRef.current?.remove(); } catch {}
        layerRef.current = null;

        if (selectedMetric !== "windDir" || selectedRegion !== "전국" || !data.length) return;

        const windData = buildWindGrid(data);
        if (!windData) return;

        // 줌 레벨이 1 증가할 때마다 픽셀/도 비율이 2배가 되므로 velocityScale을 절반으로 보정
        const velocityScale = BASE_VELOCITY_SCALE / Math.pow(2, zoomRef.current - BASE_ZOOM);

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
                velocityScale,
                particleMultiplier: 0.015,
                lineWidth: 1.5,
                colorScale: [
                    "#22d3ee",
                    "#06b6d4",
                    "#0891b2",
                    "#0e7490",
                    "#155e75",
                    "#164e63",
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
