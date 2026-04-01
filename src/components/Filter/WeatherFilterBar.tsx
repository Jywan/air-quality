"use client";
import { useWeatherStore, type WeatherMetric } from "@/store/useWeatherStore";

const METRICS: { value: WeatherMetric; label: string; desc: string }[] = [
    { value: "temp",          label: "기온",   desc: "°C"   },
    { value: "humidity",      label: "습도",   desc: "%"    },
    { value: "windSpeed",     label: "풍속",   desc: "m/s"  },
    { value: "precipitation", label: "강수량", desc: "mm/h" },
]

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
        { color: "#ef4444", label: "매우 강함"   },
    ],
    precipitation: [
        { color: "#e2e8f0", label: "없음"   },
        { color: "#bae6fd", label: "약한 비" },
        { color: "#60a5fa", label: "보통 비" },
        { color: "#2563eb", label: "강한 비" },
    ],
};

export default function WeatherFilterBar() {
    const { selectedMetric, setSelectedMetric, isLoading, updatedAt } = useWeatherStore();

    const formatted = updatedAt
        ? new Date(updatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        : "--:--";

    return (
        <header className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-wrap">
            <h1 className="text-base font-bold text-gray-800 whitespace-nowrap">
                실시간 날씨 지도
            </h1>
            <div className="flex gap-1">
                {METRICS.map((m) => (
                    <button
                        key={m.value}
                        onClick={() => setSelectedMetric(m.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedMetric === m.value
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {m.label}
                        <span className="ml-1 text-xs opacity-75">{m.desc}</span>
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-1">
                    {LEGENDS[selectedMetric].map((l) => (
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