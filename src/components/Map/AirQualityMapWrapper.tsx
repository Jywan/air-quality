"use client";
import dynamic from "next/dynamic";

const AirQualityMap = dynamic(() => import("./AirQualityMap"), { ssr: false });

export default function AirQualityMapWrapper() {
    return <AirQualityMap />;
}