import { NextResponse } from "next/server";
import { generateMockData } from "@/lib/mockData";


const BASE_URL = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc'

// 측정소명 → 자치구 매핑 (도로명 측정소 포함)
const STATION_TO_DISTRICT: Record<string, string> = {
    '종로구': '종로구', '종로': '종로구', '청계천로': '종로구',
    '중구': '중구',
    '용산구': '용산구', '한강대로': '용산구',
    '성동구': '성동구',
    '광진구': '광진구', '강변북로': '광진구',
    '동대문구': '동대문구', '홍릉로': '동대문구',
    '중랑구': '중랑구',
    '성북구': '성북구', '정릉로': '성북구',
    '강북구': '강북구',
    '도봉구': '도봉구',
    '노원구': '노원구', '화랑로': '노원구',
    '은평구': '은평구',
    '서대문구': '서대문구', '신촌로': '서대문구',
    '마포구': '마포구',
    '양천구': '양천구',
    '강서구': '강서구', '공항대로': '강서구',
    '구로구': '구로구', '시흥대로': '구로구',
    '금천구': '금천구',
    '영등포구': '영등포구', '영등포로': '영등포구',
    '동작구': '동작구', '동작대로 중앙차로': '동작구',
    '관악구': '관악구',
    '서초구': '서초구', '강남대로': '서초구',
    '강남구': '강남구', '도산대로': '강남구',
    '송파구': '송파구', '천호대로': '강동구',
    '강동구': '강동구',
}

// API 프록시
export async function GET() {

    if (!process.env.AIRKOREA_API_KEY) {
        return NextResponse.json({ data: generateMockData(), isMock: true });
    }

    try {
        const fetchPage = (pageNo: number) => {
            const params = new URLSearchParams({
                serviceKey: process.env.AIRKOREA_API_KEY!,
                returnType: "json",
                numOfRow: "10",
                pageNo: String(pageNo),
                sidoName: "서울",
                ver: "1.0",
            });
            return fetch(`${BASE_URL}/getCtprvnRltmMesureDnsty?${params}`, {
                next: { revalidate: 1800 },
            }).then((r) => r.json());
        };

        const [p1, p2, p3, p4] = await Promise.all([1, 2, 3, 4].map(fetchPage));
        const items: Record<string, string>[] = [
            ...p1.response.body.items,
            ...p2.response.body.items,
            ...p3.response.body.items,
            ...p4.response.body.items,
        ];

        type Acc = { pm25: number[]; pm10: number[]; o3: number[]; no2: number[]; co: number[]; so2: number[]; noData: boolean };
        const districtMap = new Map<string, Acc>();
        for (const item of items) {
            const key = STATION_TO_DISTRICT[item.stationName];
            if (!key) continue;
            if (!districtMap.has(key)) districtMap.set(key, { pm25: [], pm10: [], o3: [], no2: [], co: [], so2: [], noData: false });
            const d = districtMap.get(key)!;
            const pm25 = Number(item.pm25Value);
            const pm10 = Number(item.pm10Value);
            const o3   = Number(item.o3Value);
            const no2  = Number(item.no2Value);
            const co   = Number(item.coValue);
            const so2  = Number(item.so2Value);
            if (!isNaN(pm25)) d.pm25.push(pm25);
            if (!isNaN(pm10)) d.pm10.push(pm10);
            if (!isNaN(o3))   d.o3.push(o3);
            if (!isNaN(no2))  d.no2.push(no2);
            if (!isNaN(co))   d.co.push(co);
            if (!isNaN(so2))  d.so2.push(so2);
            if (isNaN(pm25) && isNaN(pm10) && isNaN(o3)) d.noData = true;
        }

        const now = new Date();
        const result = Array.from(districtMap.entries()).map(([name, v]) => ({
            districtName: name,
            pm25: v.pm25.length ? Math.round(v.pm25.reduce((a, b) => a + b, 0) / v.pm25.length) : 0,
            pm10: v.pm10.length ? Math.round(v.pm10.reduce((a, b) => a + b, 0) / v.pm10.length) : 0,
            o3:  v.o3.length  ? parseFloat((v.o3.reduce((a, b) => a + b, 0)  / v.o3.length).toFixed(3))  : 0,
            no2: v.no2.length ? parseFloat((v.no2.reduce((a, b) => a + b, 0) / v.no2.length).toFixed(3)) : 0,
            co:  v.co.length  ? parseFloat((v.co.reduce((a, b) => a + b, 0)  / v.co.length).toFixed(2))  : 0,
            so2: v.so2.length ? parseFloat((v.so2.reduce((a, b) => a + b, 0) / v.so2.length).toFixed(3)) : 0,
            updatedAt: now.toISOString(),
            hourly: [],
            noData: v.noData && v.pm25.length === 0,
        }))

        return NextResponse.json({ data: result, isMock: false });
    } catch {
        return NextResponse.json({ data: generateMockData(), isMock: true });
    }
}