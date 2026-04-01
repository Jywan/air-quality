"use client";
import dynamic from "next/dynamic";

const WeatherMap = dynamic(() => import("./WeatherMap"), { ssr: false });

export default function WeatherMapWrapper() {
    return <WeatherMap />;
}