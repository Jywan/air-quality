import { NextResponse } from "next/server";

// 따로 env 관리 예정
const BASE_URL = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc'

// API 프록시
export async function GET() {
    const params = new URLSearchParams({
        serviceKey: process.env.AIRKOREA_API_KEY!,
        returnType: 'json',
        numOfRow: '25',
        pageNo: '1',
        sidoName: '서울',
        ver: '1.0',
    })

    const res = await fetch(
        `${BASE_URL}/getCtprvnRltmMesureDnsty?${params}`,
        { next: { revalidate: 1800 } }      // 30분 캐시
    )
    const json = await res.json()
    const items = json.response.body.items

    // 에어 코리아 등답을 구별로 집계
    const districtMap = new Map<string, number[]>()
    for (const item of items) {
        const key = item.cityName   // 예: '마포구'
        if (!districtMap.has(key)) districtMap.set(key, [])
        districtMap.get(key)!.push(Number(item.pm25Value || 0))
    }

    const result = Array.from(districtMap.entries()).map(([name, value]) => ({
        districtName: name,
        pm25: Math.round(value.reduce((a, b) => a + b, 0) / value.length),
    }))

    return NextResponse.json(result)
}