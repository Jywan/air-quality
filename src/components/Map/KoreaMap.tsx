"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useAirQualityStore, type Metric, type Region } from "@/store/useAirQualityStore";

const THRESHOLDS: Record<Metric, [number, number, number]> = {
    pm25: [15, 35, 75],
    pm10: [30, 80, 150],
    o3:   [0.030, 0.090, 0.150],
    no2:  [0.030, 0.060, 0.200],
    co:   [2.00,  9.00,  15.00],
    so2:  [0.020, 0.050, 0.150],
};

const METRIC_LABEL: Record<Metric, string> = {
    pm25: "PM2.5 (㎍/㎥)",
    pm10: "PM10 (㎍/㎥)",
    o3:   "O₃ (ppm)",
    no2:  "NO₂ (ppm)",
    co:   "CO (ppm)",
    so2:  "SO₂ (ppm)",
};

const GYEONGGI_CITIES_WITH_GU = new Set([
    '수원시', '성남시', '고양시', '안산시', '부천시', '안양시', '용인시',
]);

const FLAT_GEOJSON_FILES: Partial<Record<Region, string>> = {
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

function getColor(value: number, metric: Metric): string {
    const [t1, t2, t3] = THRESHOLDS[metric];
    if (value <= t1) return "#60a5fa";
    if (value <= t2) return "#4ade80";
    if (value <= t3) return "#fb923c";
    return "#ef4444";
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
        // @ts-ignore
        const L = window.L;
        if (!L) return;
        const layer = L.geoJSON(geoJson);
        map.fitBounds(layer.getBounds(), { padding: [20, 20] });
    }, [geoJson, map]);
    return null;
}

export default function KoreaMap() {
    const { data, selectedMetric, selectedDistrict, selectedRegion, selectedCity, setSelectedDistrict, setSelectedCity } = useAirQualityStore();

    const [flatGeoJson, setFlatGeoJson] = useState<FeatureCollection | null>(null);
    const [citiesGeoJson, setCitiesGeoJson] = useState<FeatureCollection | null>(null);
    const [districtsGeoJson, setDistrictsGeoJson] = useState<FeatureCollection | null>(null);

    const isFlatRegion = selectedRegion in FLAT_GEOJSON_FILES;
    const isGyeonggiDrilldown = selectedRegion === '경기' && selectedCity !== null;

    // flat 지역 GeoJSON (서울/인천/부산 등)
    useEffect(() => {
        const file = FLAT_GEOJSON_FILES[selectedRegion];
        if (!file) return;
        setFlatGeoJson(null);
        fetch(file).then(r => r.json()).then(setFlatGeoJson);
    }, [selectedRegion]);

    // 경기 GeoJSON
    useEffect(() => {
        if (selectedRegion !== '경기') return;
        fetch('/gyeonggi-cities.geojson').then(r => r.json()).then(setCitiesGeoJson);
        fetch('/gyeonggi-districts.geojson').then(r => r.json()).then(setDistrictsGeoJson);
    }, [selectedRegion]);

    const drilldownGeoJson = useMemo(() => {
        if (!districtsGeoJson || !selectedCity) return null;
        return {
            ...districtsGeoJson,
            features: districtsGeoJson.features.filter(
                f => f.properties?.name?.startsWith(selectedCity)
            ),
        } as FeatureCollection;
    }, [districtsGeoJson, selectedCity]);

    const getCityValue = useCallback(
        (cityName: string): number => {
            const entries = data.filter(
                d => d.districtName === cityName || d.districtName.startsWith(cityName)
            );
            if (!entries.length) return 0;
            return entries.reduce((a, b) => a + b[selectedMetric], 0) / entries.length;
        },
        [data, selectedMetric]
    );

    const getDistrictValue = useCallback(
        (name: string): number => {
            return data.find(d => d.districtName === name)?.[selectedMetric] ?? 0;
        },
        [data, selectedMetric]
    );

    const styleDistrict = useCallback(
        (feature?: Feature): PathOptions => {
            const name = feature?.properties?.name ?? "";
            const value = getDistrictValue(name);
            const isSelected = name === selectedDistrict;
            const district = data.find(d => d.districtName === name);
            return {
                fillColor: data.length === 0 ? "#cbd5e1" : district?.noData ? "#9ca3af" : getColor(value, selectedMetric),
                weight: isSelected ? 3 : 1,
                color: isSelected ? "#1d4ed8" : "#64748b",
                fillOpacity: 0.75
            };
        },
        [data, selectedMetric, selectedDistrict, getDistrictValue]
    );

    const styleCity = useCallback(
        (feature?: Feature): PathOptions => {
            const name = feature?.properties?.name ?? "";
            const value = getCityValue(name);
            const hasData = data.some(
                d => d.districtName === name || d.districtName.startsWith(name)
            );
            return {
                fillColor: data.length === 0 ? "#cbd5e1" : !hasData ? "#9ca3af" : getColor(value, selectedMetric),
                weight: 1,
                color: "#64748b",
                fillOpacity: 0.75,
            };
        },
        [data, selectedMetric, getCityValue]
    );

    const onEachDistrict = useCallback(
        (feature: Feature, layer: Layer) => {
            const name: string = feature.properties?.name ?? "";
            const value = getDistrictValue(name);
            layer.bindTooltip(
                `<div style="font-weight:bold">${name}</div>` +
                `<div>${METRIC_LABEL[selectedMetric]}: ${value}</div>`,
                { sticky: true }
            );
            layer.on({
                click: () => setSelectedDistrict(selectedDistrict === name ? null : name),
                mouseover: (e) => { (e.target as L.Path).setStyle({ fillOpacity: 0.92, weight: 2 }); },
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

    const onEachCity = useCallback(
        (feature: Feature, layer: Layer) => {
            const name: string = feature.properties?.name ?? "";
            const value = getCityValue(name);
            const displayValue = Number.isInteger(value) ? value : value.toFixed(2);
            const hasDrilldown = GYEONGGI_CITIES_WITH_GU.has(name);
            layer.bindTooltip(
                `<div style="font-weight:bold">${name}${hasDrilldown ? " 🔍" : ""}</div>` +
                `<div>${METRIC_LABEL[selectedMetric]}: ${displayValue}</div>`,
                { sticky: true }
            );
            layer.on({
                click: () => {
                    if (hasDrilldown) setSelectedCity(name);
                },
                mouseover: (e) => { (e.target as L.Path).setStyle({ fillOpacity: 0.92, weight: 2 }); },
                mouseout: (e) => { (e.target as L.Path).setStyle({ fillOpacity: 0.75, weight: 1 }); },
            });
        },
        [data, selectedMetric, getCityValue, setSelectedCity]
    );

    const gyeonggiCenter: [number, number] = [37.4138, 127.5183];
    const seoulCenter: [number, number] = [37.5665, 126.978];
    const incheonCenter: [number, number] = [37.4563, 126.7052];

    const currentGeoJson =
        isFlatRegion ? flatGeoJson
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
                center={[36.5, 127.5]}
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
                        key={`flat-${selectedRegion}-${selectedMetric}-${data.length}-${selectedDistrict}`}
                        data={currentGeoJson}
                        style={styleDistrict}
                        onEachFeature={onEachDistrict}
                    />
                )}
                {currentGeoJson && selectedRegion === '경기' && !isGyeonggiDrilldown && (
                    <GeoJSON
                        key={`gyeonggi-cities-${selectedMetric}-${data.length}`}
                        data={currentGeoJson}
                        style={styleCity}
                        onEachFeature={onEachCity}
                    />
                )}
                {currentGeoJson && isGyeonggiDrilldown && (
                    <GeoJSON
                        key={`gyeonggi-drill-${selectedCity}-${selectedMetric}-${data.length}-${selectedDistrict}`}
                        data={currentGeoJson}
                        style={styleDistrict}
                        onEachFeature={onEachDistrict}
                    />
                )}
            </MapContainer>
        </div>
    );
}
