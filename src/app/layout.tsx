import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "서울시 실시간 대기질 지도",
  description: "서울시 25개구 실시간 미세먼지, 초미세먼지, 오존 현황",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="h-full flex flex-col bg-gray-50 font-sans">{children}</body>
    </html>
  );
}