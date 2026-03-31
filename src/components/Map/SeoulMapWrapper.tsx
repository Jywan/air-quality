"use client";
import dynamic from "next/dynamic";

const KoreaMap = dynamic(() => import("./KoreaMap"), { ssr: false });

export default function KoreaMapWrapper() {
    return <KoreaMap />;
}