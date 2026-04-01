"use client";
import { useWeatherStore, type WeatherMetric } from "@/store/useWeatherStore";

const METRIC_LABEL: Record<WeatherMetric, string> = {
    temp:          "기온",
    humidity:      "습도",
    windSpeed:     "풍속",
    precipitation: "강수량",
};

const UNIT: Record<WeatherMetric, string> = {
    temp:          "°C",
    humidity:      "%",
    windSpeed:     " m/s",
    precipitation: " mm/h",
};

export default function WeatherRanking() {
    const { data, selectedMetric } = useWeatherStore();

    const sorted = [...(data ?? [])]
        .filter((d) => d[selectedMetric] !== null)
        .sort((a, b) => (b[selectedMetric] as number) - (a[selectedMetric] as number));

    return (
        <div className="p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-3">
                {METRIC_LABEL[selectedMetric]} 순위
            </h2>
            <div className="space-y-1">
                {sorted.map((d, i) => (
                    <div
                        key={d.regionName}
                        className="flex items-center justify-between text-sm py-1 border-b border-gray-100"
                    >
                        <span className="text-gray-400 w-5">{i + 1}</span>
                        <span className="flex-1 font-medium text-gray-800">{d.regionName}</span>
                        <span className="font-semibold text-gray-800">
                            {d[selectedMetric]}{UNIT[selectedMetric]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
