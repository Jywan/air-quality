"use client";
import { useState } from "react";
import FilterBar from "./Filter/FilterBar";
import WeatherFilterBar from "./Filter/WeatherFilterBar";
import KoreaMapWrapper from "./Map/AirQualityMapWrapper";
import WeatherMapWrapper from "./Map/WeatherMapWrapper";
import DistrictDetail from "./Detail/DistrictDetail";
import DistrictRanking from "./Sidebar/DistrictRanking";
import WeatherRanking from "./Sidebar/WeatherRanking";
import AirQualityProvider from "./AirQualityProvider";
import WeatherProvider from "./WeatherProvider";
import { useAirQualityStore } from "@/store/useAirQualityStore";
import { useWeatherStore } from "@/store/useWeatherStore";

type AppTab = "air" | "weather";

export default function AppShell() {
    const [tab, setTab] = useState<AppTab>("air");

    const setAirRegion = useAirQualityStore((s) => s.setSelectedRegion);
    const setWeatherRegion = useWeatherStore((s) => s.setSelectedRegion);

    return (
        <div className="flex flex-col h-full">
            {tab === "air" ? <AirQualityProvider /> : <WeatherProvider />}
            <div className="flex items-center gap-1 px-4 py-1.5 bg-gray-50 border-b border-gray-200">
                <button
                    onClick={() => { setTab("air"); setWeatherRegion("전국"); }}
                    className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                        tab === "air"
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 hover:bg-gray-200"
                    }`}
                >
                    대기질
                </button>
                <button
                    onClick={() => { setTab("weather"); setAirRegion("전국"); }}
                    className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                        tab === "weather"
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 hover:bg-gray-200"
                    }`}
                >
                    날씨
                </button>
            </div>
            {tab === "air" ? <FilterBar /> : <WeatherFilterBar />}
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 relative">
                    {tab === "air" ? <KoreaMapWrapper /> : <WeatherMapWrapper />}
                </div>
                <aside className="w-80 border-l border-gray-200 bg-white overflow-auto flex-shrink-0">
                    {tab === "air" ? (
                        <>
                            <DistrictDetail />
                            <DistrictRanking />
                        </>
                    ) : (
                        <WeatherRanking />
                    )}
                </aside>
            </div>
        </div>
    );
}
