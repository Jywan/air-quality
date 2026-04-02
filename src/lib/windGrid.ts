import type { WeatherData } from "@/store/useWeatherStore";

const D_LON = 0.1;
const D_LAT = 0.1;
const PADDING = 0.5; // 데이터 범위 바깥 여백 (도 단위)

/**
 * 구/군 단위 풍향·풍속 → IDW 보간 → leaflet-velocity 격자 데이터
 * 그리드 범위는 데이터 포인트 bounding box + 여백으로 동적 계산
 */
export function buildWindGrid(data: WeatherData[]) {
    const points = data.filter(
        (d): d is WeatherData & { lat: number; lon: number; windSpeed: number; windDir: number } =>
            d.lat !== null &&
            d.lon !== null &&
            d.windSpeed !== null &&
            d.windDir !== null,
    );

    if (points.length < 2) return null;

    const lonMin = Math.min(...points.map((p) => p.lon)) - PADDING;
    const lonMax = Math.max(...points.map((p) => p.lon)) + PADDING;
    const latMin = Math.min(...points.map((p) => p.lat)) - PADDING;
    const latMax = Math.max(...points.map((p) => p.lat)) + PADDING;

    const nx = Math.round((lonMax - lonMin) / D_LON) + 1;
    const ny = Math.round((latMax - latMin) / D_LAT) + 1;

    const uGrid: number[] = [];
    const vGrid: number[] = [];

    // 북→남, 서→동 순서로 채움 (leaflet-velocity 포맷)
    for (let iy = 0; iy < ny; iy++) {
        const lat = latMax - iy * D_LAT;
        for (let ix = 0; ix < nx; ix++) {
            const lon = lonMin + ix * D_LON;

            let sumU = 0, sumV = 0, sumW = 0;

            for (const p of points) {
                const dx = p.lon - lon;
                const dy = p.lat - lat;
                const dist2 = dx * dx + dy * dy;

                // 기상 풍향(불어오는 방향) → 카르테시안 벡터
                const rad = (p.windDir * Math.PI) / 180;
                const u = -p.windSpeed * Math.sin(rad); // eastward
                const v = -p.windSpeed * Math.cos(rad); // northward

                if (dist2 < 1e-8) { sumU = u; sumV = v; sumW = 1; break; }

                const w = 1 / dist2; // IDW (power=2)
                sumU += w * u;
                sumV += w * v;
                sumW += w;
            }

            uGrid.push(sumW > 0 ? sumU / sumW : 0);
            vGrid.push(sumW > 0 ? sumV / sumW : 0);
        }
    }

    const header = {
        parameterUnit: "m.s-1",
        parameterCategory: 2,
        dx: D_LON, dy: D_LAT,
        lo1: lonMin, la1: latMax,
        lo2: lonMax, la2: latMin,
        nx, ny,
    };

    return [
        { header: { ...header, parameterNumber: 2, parameterNumberName: "eastward_wind"  }, data: uGrid },
        { header: { ...header, parameterNumber: 3, parameterNumberName: "northward_wind" }, data: vGrid },
    ];
}
