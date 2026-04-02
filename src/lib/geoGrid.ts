export function latLonToGrid(lat: number, lon: number): { nx: number; ny: number } {
    const DEGRAD = Math.PI / 180.0;
    const RE = 6371.00877, GRID = 5.0;
    const SLAT1 = 30.0 * DEGRAD, SLAT2 = 60.0 * DEGRAD;
    const OLON = 126.0 * DEGRAD, OLAT = 38.0 * DEGRAD;
    const XO = 43, YO = 136;

    const re = RE / GRID;
    let sn = Math.tan(Math.PI * 0.25 + SLAT2 * 0.5) / Math.tan(Math.PI * 0.25 + SLAT1 * 0.5);
    sn = Math.log(Math.cos(SLAT1) / Math.cos(SLAT2)) / Math.log(sn);
    let sf = Math.pow(Math.tan(Math.PI * 0.25 + SLAT1 * 0.5), sn) * Math.cos(SLAT1) / sn;
    const ro = re * sf / Math.pow(Math.tan(Math.PI * 0.25 + OLAT * 0.5), sn);

    const ra = re * sf / Math.pow(Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5), sn);
    let theta = lon * DEGRAD - OLON;
    if (theta > Math.PI)  theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;

    return {
        nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
        ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
    };
}

export function getCentroid(geometry: any): { lat: number; lon: number } | null {
    let coords: number[][] = [];
    if (geometry.type === 'Polygon') {
        coords = geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
        for (const poly of geometry.coordinates) {
            if (poly[0].length > coords.length) coords = poly[0];
        }
    }
    if (!coords.length) return null;
    return {
        lon: coords.reduce((s, c) => s + c[0], 0) / coords.length,
        lat: coords.reduce((s, c) => s + c[1], 0) / coords.length,
    };
}
