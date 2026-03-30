export interface HourlyData {
    hour: number
    pm25: number
    pm10: number
    o3: number
}

export interface DistrictData {
    districtName: string
    pm25: number
    pm10: number
    o3: number
    updatedAt: string
    hourly: HourlyData[]
    noData?: boolean
}

const DISTRICTS = [
    '종로구','중구','용산구','성동구','광진구','동대문구','중랑구',
    '성북구','강북구','도봉구','노원구','은평구','서대문구','마포구',
    '양천구','강서구','구로구','금천구','영등포구','동작구','관악구',
    '서초구','강남구','송파구','강동구',
]

function seededRandom(seed: number): number {
    const x = Math.sin(seed + 1) * 10000
    return x - Math.floor(x)
}

export function generateMockData(): DistrictData[] {
    const now = new Date()
    const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()

    return DISTRICTS.map((name, i) => {
        const seed = dateSeed + i * 31
        const basePm25 = 8 + Math.floor(seededRandom(seed) * 55)
        const basePm10 = Math.floor(basePm25 * (1.7 + seededRandom(seed + 1) * 0.9))
        const baseO3 = parseFloat((0.010 + seededRandom(seed + 2) * 0.120).toFixed(3))

        const hourly: HourlyData[] = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            pm25: Math.max(1, basePm25 + Math.floor((seededRandom(seed + hour * 7) - 0.5) * 20)),
            pm10: Math.max(1, basePm10 + Math.floor((seededRandom(seed + hour * 7 + 1) - 0.5) * 40)),
            o3: parseFloat(Math.max(0.001, baseO3 + (seededRandom(seed + hour * 7) - 0.5) * 0.030).toFixed(3)),
        }))

        const currentHour = now.getHours()
        return {
            districtName: name,
            pm25: hourly[currentHour].pm25,
            pm10: hourly[currentHour].pm10,
            o3: hourly[currentHour].o3,
            updatedAt: now.toISOString(),
            hourly,
        }
    })
}