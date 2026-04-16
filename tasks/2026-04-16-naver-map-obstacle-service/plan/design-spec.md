# 디자인 스펙 — 네이버지도 기반 장애물 등록 서비스

**작성일:** 2026-04-16
**작성자:** designer
**상태:** 확정

---

## 1. 디자인 시스템 확정값

### 1.1 색상 팔레트

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-primary` | `#2D3E50` | 헤더 배경, 주요 강조 |
| `--color-primary-dark` | `#1A2B3C` | hover 상태 |
| `--color-primary-light` | `#3D5166` | 보조 강조 |
| `--color-danger` | `#FF4444` | 위험 마커, 위험 배지 |
| `--color-danger-bg` | `#FFF0F0` | 위험 배지 배경 |
| `--color-warning` | `#FFA500` | 주의 마커, 주의 배지 |
| `--color-warning-bg` | `#FFF8E6` | 주의 배지 배경 |
| `--color-safe` | `#44BB44` | 안전 마커, 안전 배지 |
| `--color-safe-bg` | `#F0FFF0` | 안전 배지 배경 |
| `--color-bg` | `#F5F7FA` | 전체 배경 |
| `--color-card` | `#FFFFFF` | 카드, 패널 배경 |
| `--color-border` | `#E0E0E0` | 구분선, 입력 테두리 |
| `--color-border-focus` | `#2D3E50` | 포커스 테두리 |
| `--color-text-primary` | `#1A1A2E` | 본문 텍스트 |
| `--color-text-secondary` | `#6B7280` | 보조 텍스트, 날짜 |
| `--color-text-placeholder` | `#9CA3AF` | 입력 placeholder |
| `--color-text-on-primary` | `#FFFFFF` | 주요 배경 위 텍스트 |

### 1.2 타이포그래피

**폰트 패밀리:**
```css
font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
```
CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`

**타입 스케일:**

| 역할 | font-size | font-weight | line-height |
|------|-----------|-------------|-------------|
| 앱 제목 | 18px | 700 | 1.2 |
| 섹션 제목 | 14px | 600 | 1.4 |
| 본문 | 14px | 400 | 1.6 |
| 보조/날짜 | 12px | 400 | 1.4 |
| 배지/칩 | 11px | 600 | 1.2 |
| 버튼 | 13px | 600 | 1.2 |
| 입력 레이블 | 13px | 600 | 1.4 |
| 입력 값 | 14px | 400 | 1.5 |

### 1.3 스페이싱

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--space-1` | `4px` | 최소 간격 |
| `--space-2` | `8px` | 배지 내부 패딩 |
| `--space-3` | `12px` | 입력 내부 패딩, 소형 갭 |
| `--space-4` | `16px` | 기본 패딩 |
| `--space-5` | `20px` | 섹션 패딩 |
| `--space-6` | `24px` | 대형 패딩 |

### 1.4 형태 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius-sm` | `4px` | 배지, 칩 |
| `--radius-md` | `8px` | 카드, 버튼, 입력 |
| `--radius-lg` | `12px` | 모달, 시트 상단 |
| `--radius-full` | `9999px` | 원형 도트, 아바타 |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | 미세 그림자 |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.10)` | 카드, 사이드바 |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.15)` | 모달, InfoWindow |
| `--transition` | `0.2s ease` | 상태 전환 |

---

## 2. 컴포넌트별 상세 스펙

### 2.1 Header (App.jsx 포함)

**크기:**
- 높이: 56px (고정)
- 배경: `--color-primary`
- 패딩: 0 16px

**구성 요소:**
- 앱 이름 "장애물 지도": 좌측, 18px/700, `--color-text-on-primary`
- 마커 수 배지: 앱 이름 우측 8px, 배경 `rgba(255,255,255,0.2)`, 4px 8px 패딩
- 사이드바 토글 버튼 (태블릿): 우측, 40px × 40px 터치 타겟
- 모바일 햄버거 불필요 (하단 시트 방식 사용)

**필터바 (헤더 하단 or 사이드바 상단):**
- 데스크탑: 사이드바 상단에 위치
- 모바일: 헤더 바로 아래 가로 스크롤 가능한 칩 row

### 2.2 FilterBar

**카테고리 칩:**
- 높이: 32px
- 패딩: 0 12px
- border-radius: `--radius-full`
- 비활성: 배경 `--color-card`, 테두리 `--color-border`, 텍스트 `--color-text-secondary`
- 활성: 배경 `--color-primary`, 텍스트 `#FFF`, 테두리 없음
- 칩 목록: 전체 / 공사중 / 도로파손 / 침수 / 낙석 / 보행위험 / 기타

**위험도 토글:**
- 높이: 32px, border-radius: `--radius-md`
- 위험 활성: 배경 `--color-danger-bg`, 텍스트 `--color-danger`, 테두리 `--color-danger`
- 주의 활성: 배경 `--color-warning-bg`, 텍스트 `--color-warning`, 테두리 `--color-warning`
- 안전 활성: 배경 `--color-safe-bg`, 텍스트 `--color-safe`, 테두리 `--color-safe`
- 비활성: 배경 `--color-bg`, 텍스트 `--color-text-secondary`

### 2.3 Map 영역 (네이버지도 Placeholder)

- 데스크탑: `calc(100vw - 300px)` × `calc(100vh - 56px)`
- 모바일: `100vw` × `calc(100vh - 56px)`
- placeholder 배경: `#C8D4DC` (위성/지도 느낌의 회청색)
- placeholder 내부: 격자 패턴 + 핀 아이콘 + 안내 텍스트

**클릭 시 임시 핀:**
- 크기: 32px × 32px
- 애니메이션: drop-in (translateY -8px → 0, 0.15s ease-out)

**커스텀 마커 아이콘 스펙 (SVG):**
- 크기: 32px × 40px (핀 형태)
- 색상 변수: 위험도별 fill 색상
- 구조: 원형 헤드(r=12) + 뾰족한 꼬리 + 흰 내부 원(r=5)
- hover: scale(1.15) transform, 0.15s ease

### 2.4 InfoWindow (마커 클릭 팝업)

**크기:**
- 너비: 220px (고정)
- 높이: auto (내용에 따라)
- 패딩: 12px

**구성:**
- 상단: 카테고리 배지 + 위험도 배지 (인라인, 가로 배열)
- 제목: 14px/600, 최대 2행 말줄임
- 설명: 12px/400, 최대 3행 말줄임, `--color-text-secondary`
- 날짜: 11px, `--color-text-secondary`
- 하단: 수정 버튼(주요) + 삭제 버튼(위험) 가로 배열
- 닫기(X): 우상단 절대 위치, 20px × 20px

**위험도 배지:**
- 위험: `#FF4444` 배경, 흰 텍스트
- 주의: `#FFA500` 배경, 흰 텍스트
- 안전: `#44BB44` 배경, 흰 텍스트

### 2.5 ObstacleForm (등록/수정 폼)

**데스크탑 표시:** 지도 위 중앙 정렬 오버레이 모달
- 너비: 400px
- 최대 높이: 80vh (스크롤)
- 배경: `--color-card`
- 박스 쉐도우: `--shadow-lg`
- border-radius: `--radius-lg`

**모바일 표시:** 하단 Sheet
- 너비: 100%
- 최대 높이: 90vh
- border-radius: 16px 16px 0 0
- 백드롭: `rgba(0,0,0,0.4)`

**필드 구성:**
1. 제목 (text input, 필수)
   - 레이블: "제목 *"
   - placeholder: "장애물 제목을 입력하세요"
   - 최대 길이: 100자
   - 높이: 44px

2. 카테고리 (select + 직접입력)
   - 드롭다운: 기본 6종 + "직접 입력" 옵션
   - 직접 입력 선택 시: text input 노출 (슬라이드 다운 0.2s)
   - 높이: 44px

3. 위험도 (라디오 버튼 그룹)
   - 3개 버튼 가로 배열, 균등 분할
   - 각 버튼: 44px 높이, 위험도 색상 테두리+배경
   - 선택된 버튼: 해당 색상 배경 + 흰 텍스트
   - 미선택: 흰 배경 + 해당 색상 테두리

4. 설명 (textarea, 선택)
   - 레이블: "설명"
   - placeholder: "장애물에 대한 설명을 입력하세요 (선택)"
   - 최소 높이: 80px, 최대 높이: 200px
   - resize: vertical

**버튼:**
- 저장: `--color-primary` 배경, 흰 텍스트, 44px 높이, flex:1
- 취소: `--color-border` 배경, `--color-text-secondary` 텍스트, 44px 높이, 고정 너비 80px
- 배치: 하단 고정, flex row, gap 8px

**폼 검증 상태:**
- 에러: 테두리 `--color-danger`, 에러 메시지 12px `--color-danger` (input 아래)
- 포커스: 테두리 `--color-border-focus`, box-shadow `0 0 0 3px rgba(45,62,80,0.12)`

### 2.6 MarkerList (사이드바 목록)

**컨테이너:**
- 너비: 300px (데스크탑 고정)
- 높이: `calc(100vh - 56px)` (헤더 제외 전체)
- overflow-y: auto
- 배경: `--color-card`
- 우측 테두리: `1px solid --color-border`
- 박스쉐도우: `--shadow-md` (오른쪽만)

**검색 인풋:**
- 위치: 사이드바 상단 (필터바 아래)
- 높이: 40px
- 패딩: 0 12px 0 36px (좌측 돋보기 아이콘 공간)
- 배경: `--color-bg`
- 테두리: `1px solid --color-border`

**목록 아이템:**
- 높이: auto (최소 64px)
- 패딩: 12px 12px 12px 16px
- 경계선: 하단 `1px solid --color-border`
- hover: 배경 `#F8F9FA`
- 클릭: 배경 `#EEF2F7` (active 상태)

**아이템 구조:**
```
[위험도 도트 8px] [제목 텍스트]          [삭제 X 버튼]
                  [카테고리 배지] [날짜]
```
- 위험도 도트: 8px × 8px 원, 절대 위치
- 제목: 14px/600, 한 줄 말줄임, 최대 너비 calc(100% - 80px)
- 카테고리 배지: 11px, 배경 `--color-bg`, 테두리 `--color-border`
- 날짜: 11px, `--color-text-secondary`
- 삭제 버튼: 28px × 28px, 투명 배경, hover 시 `--color-danger` 색상

**빈 상태:**
- 중앙 배치, 아이콘 + "등록된 장애물이 없습니다" + 안내 문구

---

## 3. CSS 아키텍처 권장

### 결정: CSS Modules 채택

**이유:**
1. React + Vite 조합에서 기본 지원되며 추가 설치 불필요
2. 컴포넌트 단위 스코프 격리 — 네이버지도 InfoWindow 내 HTML 문자열과 충돌 없음
3. CSS 변수(Custom Properties)와 완벽하게 호환 — 디자인 토큰은 `:root`에 전역 선언
4. Tailwind는 유틸리티 클래스가 인라인에 집중되어 복잡한 상태(hover, active, 위험도 동적 색상) 표현 시 가독성 저하
5. styled-components는 런타임 오버헤드와 SSR 없는 환경에서 불필요한 복잡도 추가

**구조:**
```
src/
  styles/
    variables.css       ← CSS 커스텀 프로퍼티 전역 선언 (:root)
    reset.css           ← 기본 초기화
    global.css          ← 전역 스타일 (body, scrollbar 등)
  components/
    Header.module.css
    FilterBar.module.css
    Map.module.css
    ObstacleForm.module.css
    MarkerList.module.css
```

**네이버지도 InfoWindow 예외 처리:**
InfoWindow content는 HTML 문자열로 전달되므로 CSS Modules 스코프 밖에 위치함.
`src/styles/info-window.css` 를 별도로 생성하여 전역으로 로드한다.

---

## 4. 반응형 브레이크포인트 및 전환 동작

### 브레이크포인트

| 이름 | 범위 | 레이아웃 |
|------|------|----------|
| mobile | < 768px | 지도 전체 화면 + 하단 시트 |
| tablet | 768px ~ 1023px | 사이드바 기본 숨김 + 토글 |
| desktop | 1024px+ | 사이드바 고정 + 지도 나머지 |

### 전환 동작

**모바일 (< 768px):**
- 헤더: 56px, 앱 이름만 표시 (통계 배지 숨김)
- 필터바: 헤더 아래 가로 스크롤 칩 row (높이 44px, padding 0 16px)
- 지도: `calc(100vh - 56px - 44px)` 전체 사용
- 하단 시트:
  - 접힌 상태: 높이 60px, 핸들 바 + 마커 수 표시
  - 절반 열린 상태: 높이 45vh (드래그 중간 단계)
  - 완전 열린 상태: 높이 85vh
  - 전환: `transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
  - 배경: `--color-card`, 상단 border-radius `--radius-lg`
  - 핸들 바: 중앙 상단 4px × 32px 회색 바

**태블릿 (768px ~ 1023px):**
- 사이드바: 기본 숨김, 토글 버튼(헤더 우측) 클릭 시 슬라이드 인
- 사이드바 전환: `transform: translateX(-300px) → translateX(0)`, 0.25s ease
- 사이드바 열린 경우 지도 위에 오버레이로 표시 (지도 영역 축소 안 함)
- 백드롭: `rgba(0,0,0,0.3)` 오버레이, 클릭 시 닫힘

**데스크탑 (1024px+):**
- 사이드바: 300px 고정, 좌측 배치
- 지도: `calc(100% - 300px)` 우측
- 레이아웃: `display: flex`, 헤더 아래 row 방향

### 미디어쿼리 스니펫 패턴
```css
/* mobile first */
.container { /* 모바일 기본 */ }

@media (min-width: 768px) {
  .container { /* 태블릿+ */ }
}

@media (min-width: 1024px) {
  .container { /* 데스크탑 */ }
}
```

---

## 5. 컴포넌트 트리 구조

```
App
├── styles/variables.css          (전역 CSS 변수)
├── styles/reset.css              (초기화)
├── styles/global.css             (전역 스타일)
├── styles/info-window.css        (InfoWindow 전역 스타일)
│
├── Header                        (헤더 + 마커 수 배지)
│   └── [모바일] FilterChipRow   (헤더 아래 가로 스크롤 칩)
│
├── [데스크탑/태블릿] Sidebar
│   ├── FilterBar                 (카테고리 칩 + 위험도 토글)
│   ├── SearchInput               (검색 인풋)
│   └── MarkerList                (목록 아이템 반복)
│       └── MarkerListItem × n   (도트 + 제목 + 배지 + 삭제)
│
├── MapContainer                  (지도 래퍼)
│   └── Map                       (네이버지도 인스턴스)
│       ├── [조건부] TempPin      (클릭 시 임시 핀 오버레이)
│       └── [조건부] InfoWindow   (마커 클릭 팝업, 네이버 네이티브)
│
├── [조건부] ObstacleForm         (등록/수정 폼)
│   ├── 데스크탑: 중앙 모달 오버레이
│   └── 모바일: 하단 Sheet
│
└── [모바일] BottomSheet          (하단 시트 래퍼)
    ├── SheetHandle               (핸들 바)
    ├── FilterBar                 (위와 동일 컴포넌트)
    ├── SearchInput               (위와 동일 컴포넌트)
    └── MarkerList                (위와 동일 컴포넌트)
```

### 상태 흐름 (App 레벨)

```
App state:
  obstacles[]           ← localStorage에서 로드
  selectedCategories[]  ← 필터 상태
  selectedDangerLevels[]← 필터 상태
  activeMarkerId        ← 선택된 마커 ID
  formState             ← null | { mode: 'create'|'edit', lat, lng, data? }
  mapInstance           ← 네이버지도 인스턴스 ref
  sheetOpen             ← 모바일 하단 시트 상태

파생 데이터:
  filteredObstacles = obstacles.filter(by categories + dangerLevels)
```

---

## 6. 퍼블리싱 파일 목록

`plan/design/` 폴더 구성:

| 파일 | 내용 |
|------|------|
| `index.html` | 데스크탑 전체 레이아웃 (사이드바 + 지도 + 필터) |
| `mobile.html` | 모바일 레이아웃 (하단 시트 + 지도) |
| `form.html` | ObstacleForm 상태 모음 (등록/수정/에러/모바일시트) |
| `infowindow.html` | InfoWindow 및 마커 색상 상태 모음 |
| `style.css` | CSS 변수 + 공통 스타일 |
| `layout.css` | 레이아웃 (헤더, 사이드바, 지도 영역) |
| `components.css` | 필터바, 목록, 폼 컴포넌트 스타일 |
