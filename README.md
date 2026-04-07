# 한국 환경 지도

대한민국 전국의 실시간 대기질 및 날씨 정보를 인터랙티브 지도로 시각화하는 웹 애플리케이션입니다.

## 주요 기능

### 대기질 탭
- 전국 시도 및 시군구 단위 대기질 정보 표시
- 측정 항목: PM2.5, PM10, O₃, NO₂, CO, SO₂
- 측정소별 수치를 지도 색상으로 표현 (좋음 → 보통 → 나쁨 → 매우나쁨)
- 시군구 클릭 시 상세 정보 및 오염물질 차트 표시
- 우측 사이드바 순위 목록

### 날씨 탭
- 전국 시도 및 시군구 단위 실시간 날씨 표시
- 측정 항목: 기온, 습도, 풍속, 풍향, 강수량
- 풍향 탭 선택 시 풍속 벡터 오버레이 표시 (leaflet-velocity)
- 우측 사이드바 순위 목록

### 공통
- 전국 → 시도 단위 드릴다운 탐색
- 경기도: 시(시/군) → 구 2단계 드릴다운 (수원시, 성남시, 고양시, 안산시, 부천시, 안양시, 용인시)
- 순위 목록 행 클릭 시 지도 하이라이트 동기화

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2.1 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| 지도 | Leaflet, react-leaflet, leaflet-velocity |
| 상태 관리 | Zustand |
| 차트 | Recharts |
| 언어 | TypeScript |

## 데이터 출처

- **대기질**: 한국환경공단 에어코리아 API (`data.go.kr`)
- **날씨**: 기상청 단기예보 API (`apis.data.go.kr`)

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성합니다.

```env
AIRKOREA_API_KEY=발급받은_에어코리아_API_키
WEATHER_API_KEY=발급받은_기상청_API_키
```

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

### 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── air-quality/    # 대기질 API 라우트 (에어코리아)
│   │   └── weather/        # 날씨 API 라우트 (기상청)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AppShell.tsx        # 탭 전환 레이아웃
│   ├── Map/                # 지도 컴포넌트 (Leaflet + GeoJSON)
│   ├── Sidebar/            # 순위 목록
│   ├── Filter/             # 지역/항목 필터바
│   └── Detail/             # 대기질 상세 패널
├── store/
│   ├── useAirQualityStore.ts
│   └── useWeatherStore.ts
└── lib/                    # 유틸리티 (GeoJSON 그리드 변환 등)
public/
└── *.geojson               # 전국 시도/시군구 경계 데이터
```
