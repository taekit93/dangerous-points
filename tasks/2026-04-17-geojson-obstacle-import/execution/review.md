# 코드 리뷰 — GeoJSON 장애물 임포트

**리뷰어:** reviewer
**리뷰일:** 2026-04-17
**결과:** Warning 2건 수정 필요

---

## Critical (0건)

없음.

---

## Warning (2건)

### W-1. properties 자동 매핑 범위가 PRD/ADR 스펙과 불일치

**파일:** `src/utils/geojson.js` (42-53행)

**현상:**
PRD와 ADR 결정 4에서 정의한 properties 자동 매핑 우선순위는 다음과 같다:

- title: `properties.title` -> `properties.name` -> `properties.제목` -> ""
- category: `properties.category` -> `properties.카테고리` -> ""
- dangerLevel: `properties.dangerLevel` -> `properties.danger` -> `properties.위험도` -> ""
- description: `properties.description` -> `properties.설명` -> ""

실제 구현에서는:

- title: `properties.title` -> `properties.name` (한글 키 `제목` 누락)
- category: `properties.category` (한글 키 `카테고리` 누락)
- dangerLevel: `properties.dangerLevel` -> `properties.danger_level` (스펙의 `danger`과 다름, 한글 키 `위험도` 누락)
- description: `properties.description` (한글 키 `설명` 누락)

**영향:** 한글 키를 사용하는 GeoJSON 데이터(국내 공공데이터 등)에서 자동 매핑이 실패한다. 또한 dangerLevel 매핑에서 스펙은 `danger`를 명시했으나 구현은 `danger_level`을 사용하고 있어 의도와 다르다.

**수정 지시:**
`extractTitle`, `extractDangerLevel` 함수와 `featureToObstacle` 내 category/description 추출 로직을 PRD 스펙에 맞게 보완:

```js
function extractTitle(properties) {
  if (!properties) return null
  return properties.title || properties.name || properties['제목'] || null
}

function extractDangerLevel(properties) {
  if (!properties) return null
  return properties.dangerLevel || properties.danger_level || properties.danger || properties['위험도'] || null
}
```

`featureToObstacle` 내 category, description도 동일하게:

```js
const propCategory = properties?.category || properties?.['카테고리'] || null
const propDescription = properties?.description || properties?.['설명'] || null
```

테스트에도 한글 키 매핑 케이스를 최소 1건 추가할 것.

---

### W-2. addObstacles에서 대량 데이터 시 N회 localStorage 쓰기 발생

**파일:** `src/hooks/useObstacles.js` (24-28행), `src/utils/storage.js`

**현상:**
`addObstacles(list)`는 `list.map((data) => storage.create(data))`로 구현되어, 100건 임포트 시 `storage.create`가 100회 호출된다. `storage.create`는 매 호출마다 `load()` + `save()`를 수행하므로 `localStorage.getItem` 100회 + `localStorage.setItem` 100회 + `JSON.parse`/`JSON.stringify` 각 100회가 발생한다. 이는 O(N^2) 수준의 직렬화 비용이다.

PRD 비기능 요구사항에 "대량 데이터(100건 이상) 입력 시 UI 블로킹 방지"가 명시되어 있다.

**수정 지시:**
`storage.js`에 배치 생성 함수를 추가하거나, `addObstacles` 내부에서 한 번만 읽고 한 번만 쓰도록 수정:

```js
// storage.js에 추가
export function createBatch(dataList) {
  const items = load()
  const now = new Date().toISOString()
  const newItems = dataList.map((data) => ({
    ...data,
    id: generateUUID(),
    createdAt: now,
    updatedAt: now,
  }))
  save([...items, ...newItems])
  return newItems
}
```

```js
// useObstacles.js 수정
function addObstacles(list) {
  const newItems = storage.createBatch(list)
  setObstacles((prev) => [...prev, ...newItems])
  return newItems
}
```

기존 `addObstacles` 테스트 3건이 이미 동작을 검증하고 있으므로, 리팩터링 후 통과 확인만 하면 된다.

---

## Info (3건)

### I-1. 진입점 위치가 ADR 결정 3과 상이 (문서 정합성)

ADR 결정 3은 "임포트 버튼을 DrawToolbar에 배치"로 명시되어 있으나, 실제 구현은 designer 결정(decisions.md)에 따라 Header에 배치되었다. 구현 자체는 designer 결정이 합리적이나, ADR을 업데이트하지 않아 문서와 코드가 불일치한다.

**권장:** ADR 결정 3의 내용을 "Header 우측에 배치"로 업데이트하여 문서-코드 일관성 확보.

### I-2. 파일 업로드 시 크기 제한 미설정

현재 파일 업로드에 확장자 검증(`.geojson`, `.json`)은 있으나 파일 크기 제한이 없다. FileReader로 수백 MB 파일을 읽으면 브라우저 메모리 문제가 발생할 수 있다. 현재 Out of Scope이므로 즉시 수정 불필요하지만, 향후 개선 시 고려 대상이다.

### I-3. 드래그앤드롭이 PRD Out of Scope인데 구현됨

PRD Out of Scope에 "드래그앤드롭 파일 업로드"가 명시되어 있으나, 모달 파일 탭에 `onDragOver`/`onDrop` 핸들러가 구현되어 있다. 기능적으로 유용하고 코드량이 미미하므로 제거할 필요는 없으나, PRD와의 불일치를 인지해야 한다.

---

## 통과 항목

### 코드 품질
- [PASS] 파싱 유틸(`geojson.js`)이 컴포넌트와 분리되어 독립 테스트 가능
- [PASS] 최소 diff 원칙 준수 -- 기존 파일 수정은 `useObstacles.js`(6행 추가), `App.jsx`(13행 추가), `Header.jsx`(14행 추가), `Header.module.css`(25행 추가)로 최소화
- [PASS] 불필요한 중복 코드 없음

### 보안
- [PASS] JSON.parse를 try-catch로 감싸 예외 처리
- [PASS] 파싱된 GeoJSON의 type 필드 검증 (Feature/FeatureCollection만 허용)
- [PASS] geometry type을 화이트리스트(SUPPORTED_TYPES)로 제한
- [PASS] 사용자 입력이 DOM에 직접 삽입되지 않음 (React의 기본 이스케이핑으로 XSS 방지)
- [PASS] 파일 확장자 검증 (.geojson/.json)

### 에러 처리
- [PASS] 빈 문자열 입력 시 명확한 에러 메시지
- [PASS] 잘못된 JSON 파싱 실패 시 원본 에러 메시지 포함
- [PASS] 미지원 GeoJSON 타입(GeometryCollection 등) 에러 메시지
- [PASS] 미지원 geometry는 스킵 + 카운트 표시
- [PASS] 빈 FeatureCollection (모든 Feature가 미지원 geometry) 처리 -- 경고 메시지 표시

### 데이터 변환 정확성
- [PASS] GeoJSON [lng, lat] -> 내부 { lat, lng } 변환 정확
- [PASS] Point: 단일 좌표 올바르게 변환
- [PASS] LineString: 좌표 배열 올바르게 변환, lat/lng에 첫 좌표 할당
- [PASS] Polygon: 외곽 링(index 0)만 사용, 올바르게 변환

### UI/UX
- [PASS] 디자인 스펙 대부분 준수 (모달 구조, 탭, 파싱 결과, 메타데이터 폼, 푸터)
- [PASS] 위험도 필수 필드 검증 -- 위험도 미선택 시 등록 버튼 비활성화
- [PASS] 등록 버튼 활성화 조건 정확 (파싱 성공 + 위험도 선택)
- [PASS] ESC 키, 오버레이 클릭, 닫기 버튼으로 모달 닫기
- [PASS] 접근성: role, aria-* 속성 적절히 사용

### 테스트
- [PASS] geojson.test.js: parseGeoJson 5건 + geoJsonToObstacles 9건 = 14건
- [PASS] GeoJsonImportModal.test.jsx: 13건 (모달 열기/닫기, 파싱, 위험도 선택, 등록 흐름, 다중 Feature 안내, 타입 배지)
- [PASS] useObstacles.test.js: addObstacles 관련 3건 추가
- [PASS] mock 남용 없음 -- 실제 유틸 함수를 호출하여 통합 수준 검증

---

## 최종 판정

**Warning 2건(W-1, W-2) 수정 후 통과.**

W-1(properties 매핑 스펙 불일치)과 W-2(배치 저장 성능)를 수정하면 LGTM이다.
Info 3건 중 I-1(ADR 업데이트)은 수정 권장이나 블로커는 아니다.
