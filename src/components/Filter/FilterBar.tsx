"use client";
import { useAirQualityStore, type Metric, type Region } from "@/store/useAirQualityStore";
import { CloudFog, Cloud, Sun, Factory, Car, FlaskConical } from "lucide-react";

const METRICS: { value: Metric; label: string; desc: string; icon: (active: boolean) => React.ReactNode }[] = [
    { value: "pm25", label: "PM2.5", desc: "초미세먼지", icon: (a) => <CloudFog    size={14} color={a ? "white" : "#94a3b8"} /> },
    { value: "pm10", label: "PM10",  desc: "미세먼지",   icon: (a) => <Cloud       size={14} color={a ? "white" : "#60a5fa"} /> },
    { value: "o3",   label: "O₃",   desc: "오존",       icon: (a) => <Sun         size={14} color={a ? "white" : "#facc15"} /> },
    { value: "no2",  label: "NO₂",  desc: "이산화질소", icon: (a) => <Factory     size={14} color={a ? "white" : "#f97316"} /> },
    { value: "co",   label: "CO",   desc: "일산화탄소", icon: (a) => <Car         size={14} color={a ? "white" : "#ef4444"} /> },
    { value: "so2",  label: "SO₂",  desc: "아황산가스", icon: (a) => <FlaskConical size={14} color={a ? "white" : "#a855f7"} /> },
];

const REGIONS: { value: Region; label: string }[] = [
    { value: "전국", label: "전국" },
    { value: "서울", label: "서울" },
    { value: "경기", label: "경기" },
    { value: "인천", label: "인천" },
    { value: "부산", label: "부산" },
    { value: "대구", label: "대구" },
    { value: "광주", label: "광주" },
    { value: "대전", label: "대전" },
    { value: "울산", label: "울산" },
    { value: "세종", label: "세종" },
    { value: "강원", label: "강원" },
    { value: "충북", label: "충북" },
    { value: "충남", label: "충남" },
    { value: "전북", label: "전북" },
    { value: "전남", label: "전남" },
    { value: "경북", label: "경북" },
    { value: "경남", label: "경남" },
    { value: "제주", label: "제주" },
];

const LEGEND = [
    { color: "#60a5fa", label: "좋음" },
    { color: "#4ade80", label: "보통" },
    { color: "#fb923c", label: "나쁨" },
    { color: "#ef4444", label: "매우 나쁨" },
];

export default function FilterBar() {
    const { selectedMetric, setSelectedMetric, selectedRegion, setSelectedRegion, isLoading, updatedAt } =
        useAirQualityStore();

    const formatted = updatedAt
        ? new Date(updatedAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "--:--";

    return (
        <header className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-wrap">
        <h1 className="text-base font-bold text-gray-800 whitespace-nowrap">
            실시간 대기질 지도
        </h1>

        <div className="flex gap-1 border border-gray-200 rounded-full p-0.5">
            {REGIONS.map((r) => (
            <button
                key={r.value}
                onClick={() => setSelectedRegion(r.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedRegion === r.value
                    ? "bg-gray-800 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
            >
                {r.label}
            </button>
            ))}
        </div>

        <div className="flex gap-1">
            {METRICS.map((m) => (
            <button
                key={m.value}
                onClick={() => setSelectedMetric(m.value)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedMetric === m.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
                {m.icon(selectedMetric === m.value)}
                {m.label}
                <span className="ml-1 text-xs opacity-75">{m.desc}</span>
            </button>
            ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1">
            {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-0.5">
                <span
                    className="w-3 h-3 rounded-sm inline-block"
                    style={{ backgroundColor: l.color }}
                />
                <span className="text-xs text-gray-500">{l.label}</span>
                </div>
            ))}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
            {isLoading ? "갱신 중..." : `갱신 ${formatted}`}
            </span>
        </div>
        </header>
    );
}
