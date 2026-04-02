import { NextResponse, NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { latLonToGrid, getCentroid } from "@/lib/geoGrid";

const BASE_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";

const REGION_GRID: Record<string, { nx: number; ny: number }> = {
    서울: { nx: 60, ny: 127 },
    인천: { nx: 55, ny: 124 },
    경기: { nx: 60, ny: 121 },
    강원: { nx: 73, ny: 134 },
    충북: { nx: 69, ny: 107 },
    충남: { nx: 63, ny: 110 },
    전북: { nx: 63, ny: 89  },
    전남: { nx: 50, ny: 67  },
    경북: { nx: 91, ny: 106 },
    경남: { nx: 91, ny: 77  },
    부산: { nx: 98, ny: 76  },
    대구: { nx: 89, ny: 90  },
    광주: { nx: 58, ny: 74  },
    대전: { nx: 67, ny: 100 },
    울산: { nx: 102, ny: 84 },
    세종: { nx: 66, ny: 103 },
    제주: { nx: 53, ny: 38  },
};

const REGION_LATLON: Record<string, { lat: number; lon: number }> = {
    서울: { lat: 37.5665, lon: 126.9780 }, 인천: { lat: 37.4563, lon: 126.7052 },
    경기: { lat: 37.4138, lon: 127.5183 }, 강원: { lat: 37.5550, lon: 128.2098 },
    충북: { lat: 36.6357, lon: 127.4914 }, 충남: { lat: 36.6588, lon: 126.6728 },
    전북: { lat: 35.7175, lon: 127.1530 }, 전남: { lat: 34.8160, lon: 126.4630 },
    경북: { lat: 36.4919, lon: 128.8889 }, 경남: { lat: 35.4606, lon: 128.2132 },
    부산: { lat: 35.1796, lon: 129.0756 }, 대구: { lat: 35.8714, lon: 128.6014 },
    광주: { lat: 35.1595, lon: 126.8526 }, 대전: { lat: 36.3504, lon: 127.3845 },
    울산: { lat: 35.5384, lon: 129.3114 }, 세종: { lat: 36.4801, lon: 127.2890 },
    제주: { lat: 33.4996, lon: 126.5312 },
};

const REGION_GEOJSON: Record<string, string> = {
    서울: 'seoul-districts.geojson',
    인천: 'incheon-districts.geojson',
    경기: 'gyeonggi-cities.geojson',
    부산: 'busan-districts.geojson',
    대구: 'daegu-districts.geojson',
    광주: 'gwangju-districts.geojson',
    대전: 'daejeon-districts.geojson',
    울산: 'ulsan-districts.geojson',
    세종: 'sejong-districts.geojson',
    강원: 'gangwon-districts.geojson',
    충북: 'chungbuk-districts.geojson',
    충남: 'chungnam-districts.geojson',
    전북: 'jeonbuk-districts.geojson',
    전남: 'jeonnam-districts.geojson',
    경북: 'gyeongbuk-districts.geojson',
    경남: 'gyeongnam-districts.geojson',
    제주: 'jeju-districts.geojson',
};

function getBaseDateTime(): { date: string; time: string } {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    if (kst.getUTCMinutes() < 10) kst.setUTCHours(kst.getUTCHours() - 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
        date: `${kst.getUTCFullYear()}${pad(kst.getUTCMonth() + 1)}${pad(kst.getUTCDate())}`,
        time: `${pad(kst.getUTCHours())}00`,
    };
}

async function fetchDistrict(districtName: string, nx: number, ny: number, lat?: number, lon?: number) {
    const { date, time } = getBaseDateTime();
    const params = new URLSearchParams({
        serviceKey: process.env.WEATHER_API_KEY!,
        pageNo: "1",
        numOfRows: "10",
        dataType: "JSON",
        base_date: date,
        base_time: time,
        nx: String(nx),
        ny: String(ny),
    });

    const res = await fetch(`${BASE_URL}/getUltraSrtNcst?${params}`, {
        next: { revalidate: 1800 },
    });
    const json = await res.json();
    const items: { category: string; obsrValue: string }[] =
        json.response?.body?.items?.item ?? [];

    const get = (cat: string): number | null => {
        const v = items.find((i) => i.category === cat)?.obsrValue;
        return v !== undefined ? Number(v) : null;
    };

    return {
        districtName,
        lat: lat ?? null,
        lon: lon ?? null,
        temp: get("T1H"),
        humidity: get("REH"),
        windSpeed: get("WSD"),
        windDir: get("VEC"),
        precipitation: get("RN1"),
    };
}

export async function GET(req: NextRequest) {
    const sido = req.nextUrl.searchParams.get("sido") ?? "전국";
    const city = req.nextUrl.searchParams.get("city");

    try {
        if (sido === "전국") {
            const data = await Promise.all(
                Object.entries(REGION_GRID).map(([name, grid]) => {
                    const ll = REGION_LATLON[name];
                    return fetchDistrict(name, grid.nx, grid.ny, ll?.lat, ll?.lon);
                })
            );
            return NextResponse.json({ data });
        }
        
        // 경기 드릴다운: 특정 시의 구/군 단위 조회
        if (sido === "경기" && city) {

            const geoPath = path.join(process.cwd(), "public", "gyeonggi-districts.geojson");
            const geoJson = JSON.parse(await fs.readFile(geoPath, "utf-8"));
            const districts = (geoJson.features as any[])
                .filter((f) => (f.properties?.name ?? "").startsWith(city))
                .map((f) => {
                    const name: string = f.properties?.name ?? "";
                    const centroid = getCentroid(f.geometry);
                    if (!centroid) return null;
                    const grid = latLonToGrid(centroid.lat, centroid.lon);
                    return { name, ...grid, lat: centroid.lat, lon: centroid.lon };
                })
                .filter(Boolean) as { name: string; nx: number; ny: number, lat: number; lon: number }[];
            
            const data = await Promise.all(
                districts.map((d) => fetchDistrict(d.name, d.nx, d.ny, d.lat, d.lon))
            );
            return NextResponse.json({ data });
        }

        const geoFile = REGION_GEOJSON[sido];
        if (!geoFile) return NextResponse.json({ error: "Unknown region" }, { status: 400 });

        const geoPath = path.join(process.cwd(), "public", geoFile);
        const geoJson = JSON.parse(await fs.readFile(geoPath, "utf-8"));

        const districts = (geoJson.features as any[])
            .map((f) => {
                const name: string = f.properties?.name ?? "";
                const centroid = getCentroid(f.geometry);
                if (!centroid) return null;
                const grid = latLonToGrid(centroid.lat, centroid.lon);
                return { name, ...grid, lat: centroid.lat, lon: centroid.lon };
            })
            .filter(Boolean) as { name: string; nx: number; ny: number, lat:number, lon: number }[];

        const data = await Promise.all(
            districts.map((d) => fetchDistrict(d.name, d.nx, d.ny, d.lat, d.lon))
        );

        return NextResponse.json({ data });
    } catch (e) {
        console.error("[weather API error]", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
