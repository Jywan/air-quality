# 서울시 실시간 대기질 지도

서울시 25개 자치구의 실시간 미세먼지(PM2.5 · PM10) 및 오존(O₃) 현황을 지도 히트맵과 차트로 시각화하는 웹 애플리케이션입니다.

## 주요 기능

- **구별 색상 히트맵** — 미세먼지 농도에 따라 서울 지도를 색상으로 표시
- **구 클릭 상세 팝업** — 24시간 시간별 추이 차트 제공
- **지표 필터** — PM2.5 / PM10 / O₃ 전환
- **전체 구 랭킹** — 우측 사이드바에서 농도 순위 확인
- **자동 갱신** — 30분 주기 polling (API 키 적용 시 실시간 데이터)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16 + TypeScript |
| 지도 | Leaflet + react-leaflet |
| 차트 | Recharts |
| 상태관리 | Zustand |
| 스타일 | Tailwind CSS v4 |

## 데이터 소스

| 데이터 | API |
|--------|-----|
| 대기질 / 미세먼지 | [에어코리아 API (data.go.kr)](https://www.data.go.kr) |

API 키 미설정 시 자동으로 목(Mock) 데이터로 동작합니다.

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정 (선택)

```bash
cp .env.example .env.local
```

`.env.local`에 에어코리아 API 키를 입력합니다:

```env
AIRKOREA_API_KEY=your_api_key_here
```

> API 키 없이도 목 데이터로 정상 동작합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

## 환경변수

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `AIRKOREA_API_KEY` | 선택 | 에어코리아 Open API 인증키 |

## 프로젝트 구조

```
src/
├── app/
│   ├── api/air-quality/   # API 프록시 (에어코리아 + mock fallback)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Map/               # Leaflet 코로플레스 지도
│   ├── Filter/            # 지표 선택 필터바
│   ├── Sidebar/           # 구별 랭킹
│   ├── Detail/            # 선택 구 상세 + 차트
│   └── AirQualityProvider.tsx
├── hooks/
│   └── useAirQuality.ts   # 데이터 fetch + 30분 polling
├── lib/
│   └── mockData.ts        # API 키 없을 때 사용하는 목 데이터
└── store/
    └── useAirQualityStore.ts
