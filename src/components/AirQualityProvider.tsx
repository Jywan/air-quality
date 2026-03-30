"use client";

import { useAirQuality } from "@/hooks/useAirQuality";

export default function AirQualityProvider() {
    useAirQuality();
    return null;
}