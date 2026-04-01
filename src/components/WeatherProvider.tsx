"use client";
import { useWeather } from "@/hooks/useWeather";

export default function WeatherProvider() {
    useWeather();
    return null;
}