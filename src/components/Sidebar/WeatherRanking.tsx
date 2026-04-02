"use client";
import { useWeatherStore, type WeatherMetric } from "@/store/useWeatherStore";

const METRIC_LABEL: Record<WeatherMetric, string> = {
    temp:          "기온",
    humidity:      "습도",
    windSpeed:     "풍속",
    windDir:       "풍향",
    precipitation: "강수량",
};

const UNIT: Record<WeatherMetric, string> = {
    temp:          "°C",
    humidity:      "%",
    windSpeed:     " m/s",
    windDir:       "°",
    precipitation: " mm/h",
};

export default function WeatherRanking() {
    const { data, selectedMetric, selectedDistrict, setSelectedDistrict } = useWeatherStore();

    if (!data.length) {
        return (
            <div className="p-4 text-sm text-gray-400 text-center">데이터 로딩 중...</div>
        );
    }

    if (selectedMetric === "windDir") {
        return (
            <div className="p-4 text-sm text-gray-400 text-center">풍향은 순위를 제공하지 않습니다.</div>
        );
    }

    const sorted = [...data]
        .filter((d) => d !== null && d[selectedMetric] !== null)
        .sort((a, b) => (b[selectedMetric] as number) - (a[selectedMetric] as number));

    return (
        <div className="p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {METRIC_LABEL[selectedMetric]} 순위
            </p>
            <ul className="space-y-1">
                {sorted.map((d, i) => {
                    const isSelected = d.districtName === selectedDistrict;
                    return (
                        <li
                            key={d.districtName}
                            onClick={() => setSelectedDistrict(isSelected ? null : d.districtName)}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                                isSelected ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-50"
                            }`}
                        >
                            <span className="w-5 text-right text-gray-400 text-xs font-mono">{i + 1}</span>
                            <span className="flex-1 font-medium text-gray-700">{d.districtName}</span>
                            <span className="font-bold text-gray-800">
                                {d[selectedMetric]}{UNIT[selectedMetric]}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
