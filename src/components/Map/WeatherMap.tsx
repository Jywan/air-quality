"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useWeatherStore, type WeatherMetric } from "@/store/useWeatherStore";
import WindLayer from "./WindLayer";


const METRIC_LABEL: Record<WeatherMetric, string> = {
    temp:          "기온 (°C)",
    humidity:      "습도 (%)",
    windSpeed:     "풍속 (m/s)",
    windDir:       "풍향",
    precipitation: "강수량 (mm/h)",
};

const GYEONGGI_CITIES_WITH_GU = new Set([
    '수원시', '성남시', '고양시', '안산시', '부천시', '안양시', '용인시',
]);

const FLAT_GEOJSON_FILES: Partial<Record<string, string>> = {
    '전국': '/korea-provinces.geojson',
    '서울': '/seoul-districts.geojson',
    '인천': '/incheon-districts.geojson',
    '부산': '/busan-districts.geojson',
    '대구': '/daegu-districts.geojson',
    '광주': '/gwangju-districts.geojson',
    '대전': '/daejeon-districts.geojson',
    '울산': '/ulsan-districts.geojson',
    '세종': '/sejong-districts.geojson',
    '강원': '/gangwon-districts.geojson',
    '충북': '/chungbuk-districts.geojson',
    '충남': '/chungnam-districts.geojson',
    '전북': '/jeonbuk-districts.geojson',
    '전남': '/jeonnam-districts.geojson',
    '경북': '/gyeongbuk-districts.geojson',
    '경남': '/gyeongnam-districts.geojson',
    '제주': '/jeju-districts.geojson',
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
        case "windDir":
            return "#94a3b8";
        case "precipitation":
            if (value === 0) return "#e2e8f0";
            if (value <= 1)  return "#bae6fd";
            if (value <= 10) return "#60a5fa";
            return "#2563eb";
    }
}

function formatValue(value: number | null, metric: WeatherMetric): string {
    if (value === null) return "데이터 없음";
    switch (metric) {
        case "temp":          return `${value}°C`;
        case "humidity":      return `${value}%`;
        case "windSpeed":     return `${value} m/s`;
        case "windDir": {
            const dirs = ["북","북북동","북동","동북동","동","동남동","남동","남남동","남","남남서","남서","서남서","서","서북서","북서","북북서"];
            return dirs[Math.round(value / 22.5) % 16];
        }
        case "precipitation": return `${value} mm/h`;
    }
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, { animate: false });
        map.invalidateSize();
    }, [center, zoom, map]);
    return null;
}

function FitBoundsController({ geoJson }: { geoJson: FeatureCollection }) {
    const map = useMap();
    useEffect(() => {
        if (!geoJson.features.length) return;
        const L = (window as any).L;
        if (!L) return;
        const layer = L.geoJSON(geoJson);
        map.fitBounds(layer.getBounds(), { padding: [20, 20], animate: false });
        map.invalidateSize();
    }, [geoJson, map]);
    return null;
}

const seoulCenter:   [number, number] = [37.5665, 126.978];
const incheonCenter: [number, number] = [37.4563, 126.7052];
const gyeonggiCenter:[number, number] = [37.4138, 127.5183];

export default function WeatherMap() {
    const { 
        data, selectedMetric, selectedRegion, selectedCity, selectedDistrict,
        setSelectedCity, setSelectedDistrict
    } = useWeatherStore();

    const [flatGeoJson,         setFlatGeoJson]         = useState<FeatureCollection | null>(null);
    const [citiesGeoJson,       setCitiesGeoJson]       = useState<FeatureCollection | null>(null);
    const [districtsGeoJson,    setDistrictsGeoJson]    = useState<FeatureCollection | null>(null);

    const isFlatRegion = selectedRegion in FLAT_GEOJSON_FILES;
    const isGyeonggiDrilldown = selectedRegion === "경기" && selectedCity !== null;

    useEffect(() => {
        const file = FLAT_GEOJSON_FILES[selectedRegion];
        if (!file) return;
        setFlatGeoJson(null);
        fetch(file).then((r) => r.json()).then(setFlatGeoJson);
    }, [selectedRegion]);

    useEffect(() => {
        if (selectedRegion !== "경기") return;
        fetch('/gyeonggi-cities.geojson').then((r) => r.json()).then(setCitiesGeoJson);
        fetch('/gyeonggi-districts.geojson').then((r) => r.json()).then(setDistrictsGeoJson);
    }, [selectedRegion]);

    const drilldownGeoJson = useMemo(() => {
        if (!districtsGeoJson || !selectedCity) return null;
        return {
            ...districtsGeoJson,
            features: districtsGeoJson.features.filter(
                (f) => f.properties?.name?.startsWith(selectedCity)
            ),
        } as FeatureCollection;
    }, [districtsGeoJson, selectedCity]);

    const getDistrictValue = useCallback(
        (name: string): number | null =>
            data.find((d) => d !== null && d.districtName === name)?.[selectedMetric] ?? null,
        [data, selectedMetric]
    )

    const getCityValue = useCallback(
        (cityName: string): number | null => {
            const entries = data.filter(
                (d) => d !== null && (d.districtName === cityName || d.districtName.startsWith(cityName))
            );
            if (!entries.length) return null;
            const values = entries.map((d) => d[selectedMetric]).filter((v): v is number => v !== null);
            if (!values.length) return null;
            return values.reduce((a, b) => a + b, 0) / values.length;
        },
        [data, selectedMetric]
    );

    const fillOpacity = selectedMetric === "windDir" ? 0 : 0.4;

    const styleDistrict = useCallback(
        (feature?: Feature): PathOptions => {
            const name = feature?.properties?.name ?? "";
            const value = getDistrictValue(name);
            const isSelected = name === selectedDistrict;
            return {
                fillColor: data.length === 0 ? "#cbd5e1" : getColor(value, selectedMetric),
                weight: isSelected ? 3 : 1,
                color: isSelected ? "#1d4ed8" : "#64748b",
                fillOpacity,
            };
        },
        [data, selectedMetric, selectedDistrict, fillOpacity, getDistrictValue]
    );

    const styleCity = useCallback(
        (feature? :Feature): PathOptions => {
            const name = feature?.properties?.name ?? "";
            const value = getCityValue(name);
            return {
                fillColor: data.length === 0 ? "#cbd5e1" : getColor(value, selectedMetric),
                weight: 1,
                color: "#64748b",
                fillOpacity,
            };
        },
        [data, selectedMetric, fillOpacity, getCityValue]
    );

    const onEachDistrict = useCallback(
        (feature: Feature, layer: Layer) => {
            if (selectedMetric === "windDir") return;
            const name: string = feature.properties?.name ?? "";
            const value = getDistrictValue(name);
            layer.bindTooltip(
                `<div style="font-weight:bold">${name}</div>` +
                `<div>${METRIC_LABEL[selectedMetric]}: ${formatValue(value, selectedMetric)}</div>`,
                { sticky: true }
            );
            layer.on({
                click: () => setSelectedDistrict(selectedDistrict === name ? null : name),
                mouseover: (e: any) => { e.target.setStyle({ fillOpacity: Math.min(fillOpacity + 0.2, 0.92), weight: 2 }); },
                mouseout: (e: any) => {
                    e.target.setStyle({
                        fillOpacity,
                        weight: name === selectedDistrict ? 3 : 1,
                    });
                },
            });
        },
        [data, selectedMetric, selectedDistrict, fillOpacity, setSelectedDistrict, getDistrictValue]
    );

    const onEachCity = useCallback(
        (feature: Feature, layer: Layer) => {
            const name: string = feature.properties?.name ?? "";
            const value = getCityValue(name);
            const hasDrilldown = GYEONGGI_CITIES_WITH_GU.has(name);
            layer.bindTooltip(
                `<div style="font-weight:bold">${name}${hasDrilldown ? " 🔍" : ""}</div>` +
                `<div>${METRIC_LABEL[selectedMetric]}: ${formatValue(value, selectedMetric)}</div>`,
                { sticky: true }
            );
            layer.on({
                click: () => { if (hasDrilldown) setSelectedCity(name); },
                mouseover: (e: any) => { e.target.setStyle({ fillOpacity: Math.min(fillOpacity + 0.2, 0.92), weight: 2 }); },
                mouseout: (e: any) => { e.target.setStyle({ fillOpacity, weight: 1 }); },
            });
        },
        [data, selectedMetric, fillOpacity, getCityValue, setSelectedCity]
    );

    const currentGeoJson = isFlatRegion ? flatGeoJson
        : isGyeonggiDrilldown ? drilldownGeoJson
            : citiesGeoJson;
    
    return (
        <div className="relative w-full h-full">
            {isGyeonggiDrilldown && (
                <button
                    onClick={() => setSelectedCity(null)}
                    className="absolute top-3 left-12 z-[1000] bg-white border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50 flex items-center gap-1"
                >
                    ← {selectedCity}
                </button>
            )}
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
                {selectedRegion === '전국' && (
                    <MapController center={[36.0, 127.8]} zoom={7} />
                )}
                {selectedRegion === '서울' && (
                    <MapController center={seoulCenter} zoom={11} />
                )}
                {selectedRegion === '인천' && (
                    <MapController center={incheonCenter} zoom={11} />
                )}
                {selectedRegion === '경기' && !isGyeonggiDrilldown && (
                    <MapController center={gyeonggiCenter} zoom={9} />
                )}
                {isGyeonggiDrilldown && drilldownGeoJson && (
                    <FitBoundsController geoJson={drilldownGeoJson} />
                )}
                {isFlatRegion && flatGeoJson && !['전국', '서울', '인천'].includes(selectedRegion) && (
                    <FitBoundsController geoJson={flatGeoJson} />
                )}
                {currentGeoJson && isFlatRegion && (
                    <GeoJSON
                        key={`weather-flat-${selectedRegion}-${selectedMetric}-${data.length}-${selectedDistrict}`}
                        data={currentGeoJson}
                        style={styleDistrict}
                        onEachFeature={onEachDistrict}
                    />
                )}
                {currentGeoJson && selectedRegion === '경기' && !isGyeonggiDrilldown && (
                    <GeoJSON
                        key={`weather-gyeonggi-cities-${selectedMetric}-${data.length}`}
                        data={currentGeoJson}
                        style={styleCity}
                        onEachFeature={onEachCity}
                    />
                )}
                {currentGeoJson && isGyeonggiDrilldown && (
                    <GeoJSON
                        key={`weather-gyeonggi-drill-${selectedCity}-${selectedMetric}-${data.length}-${selectedDistrict}`}
                        data={currentGeoJson}
                        style={styleDistrict}
                        onEachFeature={onEachDistrict}
                    />
                )}
                <WindLayer />
            </MapContainer>
        </div>
    );
}
