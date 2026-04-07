"use client";

import { useWeatherStore, type WeatherMetric, type Region } from "@/store/useWeatherStore";
import { Thermometer, Droplets, Wind, CloudRain, Navigation } from "lucide-react";

const METRICS: { value: WeatherMetric; label: string; desc: string; icon: (active: boolean) => React.ReactNode }[] = [
    { value: "temp",          label: "기온",   desc: "°C",   icon: (a) => <Thermometer size={14} color={a ? "white" : "#ef4444"} /> },
    { value: "humidity",      label: "습도",   desc: "%",    icon: (a) => <Droplets    size={14} color={a ? "white" : "#60a5fa"} /> },
    { value: "windSpeed",     label: "풍속",   desc: "m/s",  icon: (a) => <Wind        size={14} color={a ? "white" : "#4ade80"} /> },
    { value: "windDir",       label: "풍향",   desc: "방향", icon: (a) => <Navigation  size={14} color={a ? "white" : "#06b6d4"} /> },
    { value: "precipitation", label: "강수량", desc: "mm/h", icon: (a) => <CloudRain   size={14} color={a ? "white" : "#3b82f6"} /> },
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

const LEGENDS: Record<WeatherMetric, { color: string; label: string }[]> = {
    temp: [
        { color: "#93c5fd", label: "0°C 이하" },
        { color: "#60a5fa", label: "~10°C"   },
        { color: "#4ade80", label: "~20°C"   },
        { color: "#fb923c", label: "~30°C"   },
        { color: "#ef4444", label: "30°C 초과" },
    ],
    humidity: [
        { color: "#fde047", label: "건조 ~30%" },
        { color: "#4ade80", label: "쾌적 ~60%" },
        { color: "#60a5fa", label: "습함 ~80%" },
        { color: "#3b82f6", label: "매우 습함"  },
    ],
    windSpeed: [
        { color: "#4ade80", label: "약 ~3m/s"  },
        { color: "#facc15", label: "보통 ~9m/s" },
        { color: "#fb923c", label: "강 ~14m/s"  },
        { color: "#ef4444", label: "매우 강"     },
    ],
    windDir: [
        { color: "#67e8f9", label: "약한 바람" },
        { color: "#06b6d4", label: "보통 바람" },
        { color: "#0891b2", label: "강한 바람" },
    ],
    precipitation: [
        { color: "#e2e8f0", label: "없음"   },
        { color: "#bae6fd", label: "약한 비" },
        { color: "#60a5fa", label: "보통 비" },
        { color: "#2563eb", label: "강한 비" },
    ],
};

export default function WeatherFilterBar() {
    const { selectedMetric, setSelectedMetric, selectedRegion, setSelectedRegion, isLoading, updatedAt } = useWeatherStore();

    const formatted = updatedAt
        ? new Date(updatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        : "--:--";

    return (
        <header className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-wrap">
            <h1 className="text-base font-bold text-gray-800 whitespace-nowrap">
                실시간 날씨 지도
            </h1>
            <div className="flex gap-1 border border-gray-200 rounded-full p-0.5">
                {REGIONS.map((r) => {
                    const blocked = selectedMetric === "windDir" && r.value !== "전국";
                    return (
                        <button
                            key={r.value}
                            onClick={() => { if (!blocked && selectedRegion !== r.value) setSelectedRegion(r.value); }}
                            disabled={blocked}
                            title={blocked ? "풍향은 전국에서만 표시됩니다" : undefined}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedRegion === r.value
                                    ? "bg-gray-800 text-white"
                                    : blocked
                                        ? "text-gray-300 cursor-default pointer-events-none"
                                        : "transition-colors text-gray-500 hover:bg-gray-100"
                            }`}
                        >
                            {r.label}
                        </button>
                    );
                })}
            </div>
            <div className="flex gap-1">
                {METRICS.filter((m) => m.value !== "windDir" || selectedRegion === "전국").map((m) => (
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
                    {LEGENDS[selectedMetric].map((l) => (
                        <div key={l.label} className="flex items-center gap-0.5">
                            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: l.color }} />
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
