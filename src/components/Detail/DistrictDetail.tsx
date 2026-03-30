"use client";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAirQualityStore, type Metric } from "@/store/useAirQualityStore";

const COLORS: Record<Metric, string> = {
    pm25: "#3b82f6",
    pm10: "#8b5cf6",
    o3:   "#10b981",
    no2:  "#f59e0b",
    co:   "#ef4444",
    so2:  "#6366f1",
};

const METRIC_LABEL: Record<Metric, string> = {
    pm25: "PM2.5 (㎍/㎥)",
    pm10: "PM10 (㎍/㎥)",
    o3:   "O₃ (ppm)",
    no2:  "NO₂ (ppm)",
    co:   "CO (ppm)",
    so2:  "SO₂ (ppm)",
};

export default function DistrictDetail() {
    const { data, selectedDistrict, selectedMetric, setSelectedDistrict } =
        useAirQualityStore();

    if (!selectedDistrict) return null;

    const district = data.find((d) => d.districtName === selectedDistrict);
    if (!district) return null;

    const chartData = district.hourly.map((h) => ({
        hour: `${String(h.hour).padStart(2, "0")}시`,
        value: h[selectedMetric],
    }));

    return (
        <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">{selectedDistrict}</h2>
            <button
            onClick={() => setSelectedDistrict(null)}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
            ×
            </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
            {(["pm25", "pm10", "o3", "no2", "co", "so2"] as Metric[]).map((m) => (
            <div key={m} className="text-center bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500 uppercase">{m}</div>
                <div
                className="text-xl font-bold"
                style={{ color: COLORS[m] }}
                >
                {district[m]}
                </div>
            </div>
            ))}
        </div>

        {chartData.length > 0 && (
            <>
            <p className="text-xs text-gray-500 mb-2">
                24시간 추이 — {METRIC_LABEL[selectedMetric]}
            </p>
            <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 9 }}
                    interval={5}
                />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip
                    contentStyle={{ fontSize: 11 }}
                    formatter={(v: number) => [v, METRIC_LABEL[selectedMetric]]}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS[selectedMetric]}
                    strokeWidth={2}
                    dot={false}
                />
                </LineChart>
            </ResponsiveContainer>
            </>
        )}
        </div>
    );
}
