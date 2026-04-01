import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useWeatherStore, type WeatherMetric } from "@/store/useWeatherStore";

const METRIC_LABEL: Record<WeatherMetric, string> = {
    temp:          "기온 (°C)",
    humidity:      "습도 (%)",
    windSpeed:     "풍속 (m/s)",
    precipitation: "강수량 (mm/h)",
};

function getColor(value: number | null, metric: WeatherMetric): string {
    if (value === null) return "#9ca3af";
    switch (metric) {
        case "temp":
            if (value <= 0)  return "#93c5fd";
            if (value <= 10) return "#60a5fa";
            if (value <= 20) return "#4ade80";
            if (value <= 30) return "#fb923c";
            return "#ef4444";
        case "humidity":
            if (value <= 30) return "#fde047";
            if (value <= 60) return "#4ade80";
            if (value <= 80) return "#60a5fa";
            return "#3b82f6";
        case "windSpeed":
            if (value <= 3)  return "#4ade80";
            if (value <= 9)  return "#facc15";
            if (value <= 14) return "#fb923c";
            return "#ef4444";
        case "precipitation":
            if (value === 0) return "#e2e8f0";
            if (value <= 1)  return "#bae6fd";
            if (value <= 10) return "#60a5fa";
            return "#2563eb";
    }
}

export default function WeatherMap() {
    const { data, selectedMetric } = useWeatherStore();
    const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);

    useEffect(() => {
        fetch("/korea-provinces.geojson").then((r) => r.json()).then(setGeoJson);
    }, []);

    const styleFeature = useCallback(
        (feature?: Feature): PathOptions => {
            const name = feature?.properties?.name ?? "";
            const region = data.find((d) => d.regionName === name);
            const value = region?.[selectedMetric] ?? null;
            return {
                fillColor: getColor(value, selectedMetric),
                weight: 1,
                color: "#64748b",
                fillOpacity: 0.75,
            };
        },
        [data, selectedMetric]
    );

    const onEachFeature = useCallback(
        (feature: Feature, layer: Layer) => {
            const name: string = feature.properties?.name ?? "";
            const region = data.find((d) => d.regionName === name);
            const value = region?.[selectedMetric];
            const displayValue = 
            value !== null && value !== undefined
                ? selectedMetric === "temp"          ? `${value}°C`
                : selectedMetric === "humidity"      ? `${value}%`
                : selectedMetric === "windSpeed"     ? `${value} m/s`
                : `${value} mm/h`
                : "데이터 없음";
            layer.bindTooltip(
                `<div style="font-weight:bold">${name}</div>` +
                `<div>${METRIC_LABEL[selectedMetric]}: ${displayValue}</div>`,
                { sticky: true }
            );
            layer.on({
                mouseover: (e: any) => { e.target.setStyle({ fillOpacity: 0.92, weight: 2 }); },
                mouseout:  (e: any) => { e.target.setStyle({ fillOpacity: 0.75, weight: 1 }); },
            });
        },
        [data, selectedMetric]
    );

    return (
        <MapContainer
            center={[36.0, 127.8]}
            zoom={7}
            className="w-full h-full"
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoJson && (
                <GeoJSON
                    key={`weather-${selectedMetric}-${data.length}`}
                    data={geoJson}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                />
            )}
        </MapContainer>
    );
}