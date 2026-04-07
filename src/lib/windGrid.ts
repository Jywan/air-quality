import type { WeatherData } from "@/store/useWeatherStore";

const LON_MIN = 124.0, LON_MAX = 132.0;
const LAT_MIN = 33.0,  LAT_MAX = 38.6;
const D_LON = 0.1,     D_LAT = 0.1;
const NX = Math.round((LON_MAX - LON_MIN) / D_LON) + 1; // 81
const NY = Math.round((LAT_MAX - LAT_MIN) / D_LAT) + 1; // 57

/**
 * 구/군 단위 풍향·풍속 → IDW 보간 → leaflet-velocity 격자 데이터
 * 그리드는 항상 전국 범위로 고정 (파티클 안정성 보장)
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

    const uGrid: number[] = [];
    const vGrid: number[] = [];

    // 북→남, 서→동 순서로 채움 (leaflet-velocity 포맷)
    for (let iy = 0; iy < NY; iy++) {
        const lat = LAT_MAX - iy * D_LAT;
        for (let ix = 0; ix < NX; ix++) {
            const lon = LON_MIN + ix * D_LON;

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
        lo1: LON_MIN, la1: LAT_MAX,
        lo2: LON_MAX, la2: LAT_MIN,
        nx: NX, ny: NY,
    };

    return [
        { header: { ...header, parameterNumber: 2, parameterNumberName: "eastward_wind"  }, data: uGrid },
        { header: { ...header, parameterNumber: 3, parameterNumberName: "northward_wind" }, data: vGrid },
    ];
}
