import { NextResponse } from "next/server";

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

function getBaseDateTime(): { date: string; time: string } {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    if (kst.getUTCMinutes() < 10) {
        kst.setUTCHours(kst.getUTCHours() - 1);
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
        date: `${kst.getUTCFullYear()}${pad(kst.getUTCMonth() + 1)}${pad(kst.getUTCDate())}`,
        time: `${pad(kst.getUTCHours())}00`,
    };
}

async function fetchRegion(region: string) {
    const grid = REGION_GRID[region];
    const { date, time } = getBaseDateTime();
    const params = new URLSearchParams({
        serviceKey: process.env.WEATHER_API_KEY!,
        pageNo: "1",
        numOfRow: "10",
        dataType: "JSON",
        base_date: date,
        base_time: time,
        nx: String(grid.nx),
        ny: String(grid.ny),
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
        regionName: region,
        temp: get("T1H"),
        humidity: get("REH"),
        windSpeed: get("WSD"),
        precipitation: get("RN1"),
    };
}

export async function GET() {
    try {
        console.log("[weather] API key exists:", !!process.env.WEATHER_API_KEY);
        const { date, time } = getBaseDateTime();
        console.log("[weather] base_date:", date, "base_time:", time);
        const regions = Object.keys(REGION_GRID);
        const data = await Promise.all(regions.map(fetchRegion));
        return NextResponse.json({ data });
    } catch (e) {
        console.error("[weather API error]", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
