"use client";
import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useAirQualityStore, type Metric } from "@/store/useAirQualityStore";

const THRESHOLDS: Record<Metric, [number, number, number]> = {
    pm25: [15, 35, 75],
    pm10: [30, 80, 150],
    o3:   [0.030, 0.090, 0.150],
};

const METRIC_LABEL: Record<Metric, string> = {
    pm25: "PM2.5 (㎍/㎥)",
    pm10: "PM10 (㎍/㎥)",
    o3:   "O₃ (ppm)",
};

function getColor(value: number, metric: Metric): string {
    const [t1, t2, t3] = THRESHOLDS[metric];
    if (value <= t1) return "#4ade80"; // 좋음
    if (value <= t2) return "#fbbf24"; // 보통
    if (value <= t3) return "#f97316"; // 나쁨
    return "#ef4444";                  // 매우 나쁨
}

export default function SeoulMap() {
    const { data, selectedMetric, selectedDistrict, setSelectedDistrict } =
        useAirQualityStore();
    const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);

    useEffect(() => {
        fetch("/seoul-districts.geojson")
        .then((r) => r.json())
        .then(setGeoJson);
    }, []);

    const getDistrictValue = useCallback(
        (name: string): number => {
        return data.find((d) => d.districtName === name)?.[selectedMetric] ?? 0;
        },
        [data, selectedMetric]
    );

    const styleFeature = useCallback(
        (feature?: Feature): PathOptions => {
        const name = feature?.properties?.name ?? "";
        const value = getDistrictValue(name);
        const isSelected = name === selectedDistrict;
        const district = data.find((d) => d.districtName === name);
        return {
            fillColor: data.length === 0 ? "#cbd5e1" : district?.noData ? "#9ca3af" : getColor(value, selectedMetric),
            weight: isSelected ? 3 : 1,
            color: isSelected ? "#1d4ed8" : "#64748b",
            fillOpacity: 0.75,
        };
        },
        [data, selectedMetric, selectedDistrict, getDistrictValue]
    );

    const onEachFeature = useCallback(
        (feature: Feature, layer: Layer) => {
        const name: string = feature.properties?.name ?? "";
        const value = getDistrictValue(name);

        layer.bindTooltip(
            `<div style="font-weight:bold">${name}</div>` +
            `<div>${METRIC_LABEL[selectedMetric]}: ${value}</div>`,
            { sticky: true }
        );

        layer.on({
            click: () =>
            setSelectedDistrict(selectedDistrict === name ? null : name),
            mouseover: (e) => {
            (e.target as L.Path).setStyle({ fillOpacity: 0.92, weight: 2 });
            },
            mouseout: (e) => {
            (e.target as L.Path).setStyle({
                fillOpacity: 0.75,
                weight: name === selectedDistrict ? 3 : 1,
            });
            },
        });
        },
        [data, selectedMetric, selectedDistrict, setSelectedDistrict, getDistrictValue]
    );

    return (
        <MapContainer
        center={[37.5665, 126.978]}
        zoom={11}
        className="w-full h-full"
        scrollWheelZoom
        >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJson && (
            <GeoJSON
            key={`${selectedMetric}-${data.length}-${selectedDistrict}`}
            data={geoJson}
            style={styleFeature}
            onEachFeature={onEachFeature}
            />
        )}
        </MapContainer>
    );
}
