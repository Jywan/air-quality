"use client";
import { useAirQualityStore, type Metric } from "@/store/useAirQualityStore";

const UNIT: Record<Metric, string> = {
    pm25: "㎍/㎥",
    pm10: "㎍/㎥",
    o3:   "ppm",
    no2:  "ppm",
    co:   "ppm",
    so2:  "ppm",
};

const THRESHOLDS: Record<Metric, [number, number, number]> = {
    pm25: [15, 35, 75],
    pm10: [30, 80, 150],
    o3:   [0.030, 0.090, 0.150],
    no2:  [0.030, 0.060, 0.200],
    co:   [2.00,  9.00,  15.00],
    so2:  [0.020, 0.050, 0.150],
};

function gradeLabel(value: number, metric: Metric) {
    const [t1, t2, t3] = THRESHOLDS[metric];
    if (value <= t1) return { text: "좋음",    color: "text-blue-400" };
    if (value <= t2) return { text: "보통",    color: "text-green-500" };
    if (value <= t3) return { text: "나쁨",    color: "text-orange-400" };
    return              { text: "매우 나쁨", color: "text-red-600" };
}

export default function DistrictRanking() {
    const { data, selectedMetric, selectedDistrict, setSelectedDistrict } =
        useAirQualityStore();

    if (!data.length) {
        return (
        <div className="p-4 text-sm text-gray-400 text-center">데이터 로딩 중...</div>
        );
    }

    const sorted = [...data].sort((a, b) => b[selectedMetric] - a[selectedMetric]);

    return (
        <div className="p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            전체 랭킹 ({selectedMetric.toUpperCase()})
        </p>
        <ul className="space-y-1">
            {sorted.map((d, idx) => {
            const grade = gradeLabel(d[selectedMetric], selectedMetric);
            const isSelected = d.districtName === selectedDistrict;
            return (
                <li
                key={d.districtName}
                onClick={() =>
                    setSelectedDistrict(
                    isSelected ? null : d.districtName
                    )
                }
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                    isSelected
                    ? "bg-blue-50 border border-blue-300"
                    : "hover:bg-gray-50"
                }`}
                >
                <span className="w-5 text-right text-gray-400 text-xs font-mono">
                    {idx + 1}
                </span>
                <span className="flex-1 font-medium text-gray-700">
                    {d.districtName}
                </span>
                <span className={`font-bold ${d.noData ? "text-gray-400" : "text-gray-800"}`}>
                    {d.noData ? "-" : d[selectedMetric]}
                </span>
                <span className="text-xs text-gray-400">{d.noData ? "" : UNIT[selectedMetric]}</span>
                <span className={`text-xs font-medium ${d.noData ? "text-gray-400" : grade.color}`}>
                    {d.noData ? "점검중" : grade.text}
                </span>
                </li>
            );
            })}
        </ul>
        </div>
    );
}
