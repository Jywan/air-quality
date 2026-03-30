"use client";
import dynamic from "next/dynamic";

const SeoulMap = dynamic(() => import("./SeoulMap"), { ssr: false });

export default function SeoulMapWrapper() {
    return <SeoulMap />;
}