# 디자인 스펙 — GeoJSON 가져오기 모달

**작성일:** 2026-04-17
**작성자:** designer
**상태:** 완료

---

## 1. 미적 방향성

| 항목 | 결정 |
|------|------|
| 톤 | 기존 `ObstacleForm` 모달과 동일한 딥네이비 계열 (`#2D3E50` primary) |
| 진입점 색상 | Header 우측 반투명 버튼 (기존 모드 탭과 동일한 `rgba(255,255,255,0.15)`) |
| 강조색 | 파일/GeoJSON 관련 요소에 파란색(`#3B82F6`) 사용 (info 계열) |
| 폰트 | Pretendard (CDN, 기존 `global.css`와 동일) |
| 모달 진입 애니메이션 | 모바일: `slideUp`, 데스크톱 640px+: `fadeIn` (기존과 동일) |

---

## 2. 산출물 파일

| 파일 | 역할 |
|------|------|
| `plan/design/modal.html` | 모달 전체 UI 목업 (7가지 상태 전환 데모 포함) |
| `plan/design/style.css` | 공통 스타일 (기존 디자인 토큰 재사용 + GeoJSON 전용 토큰 추가) |

---

## 3. 컴포넌트별 스펙

### 3-1. 진입점 버튼 — `GeoJsonImportButton`

- **위치:** `Header.jsx` 우측 끝 (count 배지 오른쪽) 또는 `DrawToolbar.jsx` 내
- **외형:** 아이콘(다운로드 SVG) + "GeoJSON 가져오기" 텍스트
- **배경:** `rgba(255,255,255,0.15)`, 테두리 `rgba(255,255,255,0.25)` (헤더 위)
- **hover:** `rgba(255,255,255,0.25)`
- **반응형:** 모바일(480px 이하)에서는 아이콘만 표시 가능

---

### 3-2. `GeoJsonImportModal` — 모달 컨테이너

| 속성 | 값 |
|------|----|
| 오버레이 | `rgba(0,0,0,0.45)` |
| 패널 최대 너비 | `520px` |
| 최대 높이 | `90vh` (overflow-y: auto) |
| border-radius | 모바일: top only `12px`, 데스크톱: all `12px` |
| z-index | `1000` |
| 닫기 방법 | ✕ 버튼, 오버레이 클릭, ESC 키 |

---

### 3-3. 입력 탭 — `InputTabs`

두 개의 탭으로 입력 방식 선택:

| 탭 | 레이블 | 컨텐츠 |
|----|--------|--------|
| Tab 1 | 텍스트 입력 | GeoJSON textarea + "파싱하기" 버튼 |
| Tab 2 | 파일 업로드 | 드래그앤드롭 영역 + 파일 선택 버튼 |

**탭 스타일:**
- 컨테이너: `background: var(--color-bg)`, 테두리 `1px solid var(--color-border)`, `border-radius: 8px`
- 활성 탭: `background: white`, `color: var(--color-primary)`, `box-shadow: shadow-sm`
- 비활성 탭: `color: var(--color-text-secondary)`

---

### 3-4. 텍스트 입력 패널

| 요소 | 스펙 |
|------|------|
| `textarea` | `font-family: monospace`, `min-height: 140px`, `border-radius: 8px`, 배경 `var(--color-bg)` → focus 시 `white` |
| "파싱하기" 버튼 | 우측 정렬, `padding: 7px 16px`, primary 색상 |

---

### 3-5. 파일 업로드 패널

#### 드롭존 (파일 미선택)

| 속성 | 값 |
|------|----|
| 테두리 | `2px dashed var(--color-border)` |
| hover/dragover | 테두리 `#3B82F6`, 배경 `#EFF6FF` |
| 아이콘 | 파일 SVG (22×22), 흰 배경 카드 형태 |
| 지원 형식 표시 | `.geojson`, `.json` 배지 |
| 최소 높이 | `160px` |

#### 파일 선택 완료 상태

| 속성 | 값 |
|------|----|
| 배경 | `var(--color-success-bg)` = `#ECFDF5` |
| 테두리 | `1px solid var(--color-success)` = `#10B981` |
| 체크 아이콘 | `#10B981` |
| 파일명 | 말줄임 처리 (`text-overflow: ellipsis`) |
| 제거 버튼 | 우측 ✕ (원형, 22×22) |

---

### 3-6. 파싱 결과 미리보기 — `ParseResult`

3가지 상태:

#### 성공 (`success`)

```
배경: #ECFDF5  테두리: #10B981  아이콘: ✓ (초록)
"3개의 Feature 발견"
chips: [● Point N개] [● LineString N개] [● Polygon N개]
"properties에서 자동 매핑: title, category"
```

chip 색상:
- Point: `#3B82F6` (파랑)
- LineString: `#8B5CF6` (보라)
- Polygon: `#F59E0B` (앰버)

#### 오류 (`error`)

```
배경: #FFF0F0  테두리: #FF4444  아이콘: ✕ (빨강)
"JSON 파싱 오류"
에러 메시지 (monospace code 스타일)
```

#### 경고 (`warning`)

```
배경: #FFF8E6  테두리: #FFA500  아이콘: ⚠ (주황)
"N개의 Feature 발견 (M개 제외됨)"
지원 안되는 geometry 타입 안내 (MultiPolygon 등)
```

---

### 3-7. 공통 메타데이터 폼 — `MetadataForm`

파싱 성공 또는 경고 상태일 때만 표시.
섹션 구분선 `── 공통 메타데이터 ──` 으로 시작.

| 필드 | 타입 | 필수 | 자동매핑 | 비고 |
|------|------|------|---------|------|
| 제목 | text input | 아니오 | properties.title | Feature 다수 시 "가져온 장애물 N" 자동생성 안내 표시 |
| 카테고리 | select + 직접입력 | 아니오 | properties.category | 옵션: 공사중, 도로파손, 침수, 낙석, 보행위험, 기타, 직접 입력... |
| 위험도 | radio (3선택) | **필수** | properties.dangerLevel | 위험(#FF4444), 주의(#FFA500), 안전(#44BB44) |
| 설명 | textarea | 아니오 | properties.description | rows=3 |

**자동 매핑 힌트 표시 조건:**
- properties에 해당 키가 존재하고 값이 있을 때 `↩ properties.xxx 자동 매핑됨` 표시
- Feature가 여러 개이고 값이 제각각이면 빈칸 + 힌트 미표시

**제목 자동생성 안내 박스:**
- Feature 개수 > 1 일 때 표시
- 텍스트: `Feature가 여러 개이므로 제목이 비어 있으면 "가져온 장애물 1", "가져온 장애물 2"… 형식으로 자동 생성됩니다.`
- 배경: `var(--color-bg)`, 테두리: `1px solid var(--color-border)`, `border-radius: 4px`

**위험도 라디오 선택 스타일 (기존 ObstacleForm 동일):**
- 비선택: 회색 테두리 + 회색 텍스트
- 선택: `--level-color` 테두리 + `--level-bg` 배경

---

### 3-8. 하단 버튼 영역 — `ModalFooter`

| 버튼 | 스타일 | 상태 |
|------|--------|------|
| 취소 | `flex:1`, 회색 배경, 회색 테두리 | 항상 활성 |
| N개 장애물 등록 | `flex:2`, `var(--color-primary)` 배경, 흰 텍스트 | 파싱 성공 + 위험도 선택 시 활성 |

버튼 텍스트 동적 변경:
- 파싱 전: `"장애물 등록"` (disabled)
- 파싱 후 (위험도 미선택): `"N개 장애물 등록"` (disabled)
- 위험도 선택 후: `"N개 장애물 등록"` (enabled)

푸터 스티키: `position: sticky; bottom: 0;` — 스크롤 시 항상 노출

---

## 4. 색상 토큰 추가 (기존 variables.css에 병합 필요)

```css
--color-info:          #3B82F6;
--color-info-bg:       #EFF6FF;
--color-success:       #10B981;
--color-success-bg:    #ECFDF5;
```

---

## 5. 반응형

| 브레이크포인트 | 변화 |
|---------------|------|
| `< 480px` | 모달 title 15px, danger-option gap 6px/font 12px, 패딩 축소 |
| `>= 640px` | 모달 패널 전체 `border-radius: 12px`, 오버레이 `align-items: center` |

---

## 6. 접근성

- 모달: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- 탭: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- 드롭존: `role="button"`, `aria-label`, `tabindex="0"`
- 위험도: `role="radiogroup"`, `aria-labelledby`, `aria-required="true"`
- ESC 키로 모달 닫기
- 에러 메시지: `role="alert"`
