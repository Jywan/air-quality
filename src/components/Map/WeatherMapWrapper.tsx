"use client";
import dynamic from "next/dynamic";
import { useWeatherStore } from "@/store/useWeatherStore";
import { Loader2 } from "lucide-react";

const WeatherMap = dynamic(() => import("./WeatherMap"), { ssr: false });

export default function WeatherMapWrapper() {
    const isLoading = useWeatherStore((s) => s.isLoading);

    return (
        <div className="relative w-full h-full">
            <WeatherMap />
            {isLoading && (
                <div className="absolute inset-0 z-[1000] bg-white/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md text-sm font-medium text-gray-700">
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                        데이터 불러오는 중...
                    </div>
                </div>
            )}
        </div>
    );
}
