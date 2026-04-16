# 구현 계획 — 네이버지도 기반 장애물 등록 서비스

**작성일:** 2026-04-16
**작성자:** planner
**상태:** 확정

---

## 프로젝트 구조

```
dangerous-points/
├── index.html
├── vite.config.js
├── package.json
├── .env.example              # VITE_NAVER_CLIENT_ID=your_key
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── Map.jsx           # 네이버지도 컴포넌트
│   │   ├── Map.css
│   │   ├── MarkerList.jsx    # 사이드바 마커 목록
│   │   ├── MarkerList.css
│   │   ├── ObstacleForm.jsx  # 장애물 등록/수정 폼
│   │   ├── ObstacleForm.css
│   │   ├── FilterBar.jsx     # 카테고리/위험도 필터
│   │   └── FilterBar.css
│   ├── hooks/
│   │   └── useLocalStorage.js
│   ├── utils/
│   │   └── storage.js        # localStorage CRUD
│   └── constants/
│       └── categories.js     # 기본 카테고리, 위험도 정의
└── public/
```

---

## 데이터 모델

**localStorage key:** `obstacles`

```json
{
  "id": "uuid-v4",
  "lat": 37.5665,
  "lng": 126.9780,
  "category": "공사중",
  "dangerLevel": "위험",
  "title": "제목",
  "description": "설명",
  "createdAt": "2026-04-16T09:00:00.000Z",
  "updatedAt": "2026-04-16T09:00:00.000Z"
}
```

**dangerLevel 허용값:** `"위험"` | `"주의"` | `"안전"`

---

## 위험도별 마커 색상

| 위험도 | 색상 | HEX |
|--------|------|-----|
| 위험 | 빨강 | #FF4444 |
| 주의 | 주황 | #FFA500 |
| 안전 | 초록 | #44BB44 |

---

## 기본 카테고리 (사용자 추가 가능)

공사중, 도로파손, 침수, 낙석, 보행위험, 기타

categories.js에 배열로 정의하되, 사용자가 ObstacleForm에서 직접 입력한 카테고리도 허용한다.

---

## 구현 단계

### 단계 1: 프로젝트 초기화 및 기반 설정

**목표:** React + Vite 프로젝트 스캐폴딩, 기본 의존성 설치, 환경변수 설정

**작업 내용:**
1. `npm create vite@latest . -- --template react` 실행 (현재 디렉토리에 생성)
2. 불필요한 기본 파일 정리 (App.css 기본 내용 제거, assets/ 정리)
3. `package.json` 확인 및 의존성 설치 (`npm install`)
4. `vite.config.js` 확인 (기본 설정 유지)
5. `.env.example` 생성: `VITE_NAVER_CLIENT_ID=your_client_id_here`
6. `index.html`에 네이버지도 스크립트 태그 추가:
   ```html
   <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=%VITE_NAVER_CLIENT_ID%"></script>
   ```
   (주의: Vite 환경에서는 index.html의 환경변수 치환이 안 되므로, 동적 로드 방식 검토 필요)
7. `src/constants/categories.js` 생성: 기본 카테고리 배열, 위험도 정의, 색상 매핑
8. `src/utils/storage.js` 생성: localStorage CRUD 함수 (getAll, getById, create, update, remove)
9. `src/hooks/useLocalStorage.js` 생성: React 커스텀 훅

**검증 기준:**
- `npm run dev` 실행 시 Vite 개발 서버가 정상 구동된다
- 브라우저에서 빈 React 앱이 표시된다
- `.env.example` 파일이 존재한다
- storage.js의 CRUD 함수가 정의되어 있다

**산출물:** package.json, vite.config.js, .env.example, src/main.jsx, src/App.jsx, src/constants/categories.js, src/utils/storage.js, src/hooks/useLocalStorage.js

---

### 단계 2: 네이버지도 컴포넌트 구현

**목표:** 네이버지도를 화면에 렌더링하고 기본 상호작용(줌, 이동)이 동작하도록 한다

**작업 내용:**
1. `src/components/Map.jsx` 생성
   - useRef로 지도 컨테이너 참조
   - useEffect에서 `naver.maps.Map` 인스턴스 생성
   - 초기 중심: 서울 시청 (37.5665, 126.9780), 줌 레벨 15
   - 지도 인스턴스를 부모에게 전달 (콜백 props 또는 ref)
2. `src/components/Map.css` 생성: 지도 컨테이너 스타일 (전체 화면)
3. `src/App.jsx` 수정: Map 컴포넌트 렌더링
4. 네이버지도 스크립트 동적 로드 로직 구현
   - App 마운트 시 스크립트 태그를 동적으로 생성하여 head에 삽입
   - 로드 완료 콜백에서 지도 초기화
   - `VITE_NAVER_CLIENT_ID` 환경변수에서 Client ID 읽기

**검증 기준:**
- 브라우저에서 네이버지도가 전체 화면으로 표시된다
- 지도 줌, 이동(드래그)이 정상 동작한다
- 콘솔에 API 관련 에러가 없다 (유효한 API 키 사용 시)

**산출물:** src/components/Map.jsx, src/components/Map.css

---

### 단계 3: 마커 등록/표시 및 ObstacleForm 구현

**목표:** 지도 클릭으로 장애물을 등록하고, 위험도별 색상 마커를 표시한다

**작업 내용:**
1. `src/components/ObstacleForm.jsx` 생성
   - 카테고리 입력: 드롭다운(기본 6종) + 직접 입력 옵션
   - 위험도 선택: 라디오 버튼 3개 (위험/주의/안전), 각각 색상 표시
   - 제목: 텍스트 입력 (필수)
   - 설명: 텍스트 영역 (선택)
   - 저장/취소 버튼
   - 수정 모드: 기존 데이터 pre-fill
2. `src/components/ObstacleForm.css` 생성: 폼 모달/팝업 스타일
3. Map.jsx 수정
   - 지도 클릭 이벤트 리스너 추가: 클릭 좌표를 캡처
   - 클릭 시 ObstacleForm을 해당 위치에 팝업으로 표시
   - 저장 시 storage.js의 create 호출 후 마커 생성
4. 마커 생성 로직
   - `naver.maps.Marker` 생성 시 위험도별 아이콘 색상 적용
   - 커스텀 마커 아이콘: SVG 또는 naver.maps.Icon으로 색상 지정
   - 마커 객체를 state로 관리 (id와 매핑)
5. 페이지 로드 시 복원
   - App 마운트 시 storage.js의 getAll 호출
   - 기존 장애물 데이터로 마커 일괄 생성

**검증 기준:**
- 지도 클릭 시 등록 폼이 표시된다
- 카테고리, 위험도, 제목을 입력하고 저장할 수 있다
- 저장된 마커가 지도에 올바른 색상으로 표시된다 (빨강/주황/초록)
- 새로고침 후에도 마커가 복원된다
- 카테고리 직접 입력이 동작한다

**산출물:** src/components/ObstacleForm.jsx, src/components/ObstacleForm.css, Map.jsx 수정

---

### 단계 4: 마커 상세보기, 수정, 삭제

**목표:** 마커 클릭 시 정보를 표시하고, 수정/삭제 기능을 구현한다

**작업 내용:**
1. Map.jsx 수정 — 마커 클릭 이벤트
   - 마커 클릭 시 `naver.maps.InfoWindow` 열기
   - InfoWindow 내용: 카테고리, 위험도(배지 색상), 제목, 설명, 수정/삭제 버튼
   - InfoWindow의 수정 버튼 클릭 시 ObstacleForm을 수정 모드로 열기
   - InfoWindow의 삭제 버튼 클릭 시 확인 다이얼로그 표시 후 삭제
2. 수정 기능
   - ObstacleForm에 수정 모드 props 추가 (initialData)
   - 저장 시 storage.js의 update 호출
   - 마커 아이콘 색상 갱신 (위험도 변경 시)
3. 삭제 기능
   - `window.confirm()` 또는 커스텀 확인 다이얼로그
   - storage.js의 remove 호출
   - 지도에서 마커 제거 (`marker.setMap(null)`)
   - 목록에서도 즉시 반영

**검증 기준:**
- 마커 클릭 시 인포윈도우에 장애물 정보가 표시된다
- 수정 버튼 클릭 시 기존 데이터가 채워진 폼이 열린다
- 수정 저장 시 마커 색상과 정보가 갱신된다
- 삭제 시 확인 후 마커와 데이터가 제거된다
- 수정/삭제 후 새로고침해도 변경사항이 유지된다

**산출물:** Map.jsx 수정, ObstacleForm.jsx 수정

---

### 단계 5: 사이드바 목록 및 필터링

**목표:** 장애물 목록 패널과 카테고리/위험도 필터를 구현한다

**작업 내용:**
1. `src/components/MarkerList.jsx` 생성
   - 전체 장애물 목록 표시 (카테고리 뱃지, 위험도 색상 인디케이터, 제목)
   - 항목 클릭 시 해당 마커로 지도 이동 (`map.panTo()`) 및 인포윈도우 열기
   - 삭제 버튼 (스와이프 또는 아이콘)
2. `src/components/MarkerList.css` 생성
3. `src/components/FilterBar.jsx` 생성
   - 카테고리 필터: 드롭다운 또는 칩 (다중 선택)
   - 위험도 필터: 토글 버튼 3개 (위험/주의/안전), 색상으로 구분
   - 필터 해제(전체 보기) 버튼
4. `src/components/FilterBar.css` 생성
5. App.jsx 수정
   - 필터 상태 관리 (selectedCategories, selectedDangerLevels)
   - 필터 적용 시 지도 마커 표시/숨김 (`marker.setVisible()`)
   - 필터 적용 시 목록도 필터링
6. 레이아웃 구성
   - 데스크탑: 좌측에 사이드바(FilterBar + MarkerList), 우측에 지도
   - App.css에 flexbox 레이아웃

**검증 기준:**
- 사이드바에 전체 장애물 목록이 표시된다
- 목록 항목 클릭 시 해당 마커 위치로 지도가 이동한다
- 카테고리 필터 적용 시 해당 카테고리만 지도/목록에 표시된다
- 위험도 필터 적용 시 해당 위험도만 표시된다
- 카테고리 + 위험도 복합 필터가 동작한다
- 필터 해제 시 전체가 다시 표시된다

**산출물:** src/components/MarkerList.jsx, MarkerList.css, src/components/FilterBar.jsx, FilterBar.css, App.jsx 수정, App.css

---

### 단계 6: 반응형 레이아웃 및 마무리

**목표:** 모바일/데스크탑 반응형 UI를 완성하고, 최종 품질을 점검한다

**작업 내용:**
1. 반응형 레이아웃 구현
   - 모바일(~767px): 지도 전체 화면, 하단 시트 형태의 목록 패널
     - 하단 시트 토글 버튼 (펼치기/접기)
     - 하단 시트 높이: 접힌 상태 ~60px(핸들 바만), 펼친 상태 ~50vh
   - 데스크탑(1024px~): 좌측 사이드바(300~360px 너비) + 우측 지도
   - 태블릿(768px~1023px): 접이식 사이드바 (토글 가능)
2. ObstacleForm 반응형
   - 모바일: 전체 화면 모달
   - 데스크탑: 지도 위 팝업 또는 사이드바 내 인라인
3. CSS 미디어쿼리 적용
   - 각 컴포넌트 CSS에 브레이크포인트별 스타일
   - 터치 타겟 최소 44px (모바일)
4. 최종 점검
   - 모든 CRUD 동작 확인
   - 필터링 동작 확인
   - 반응형 브레이크포인트별 레이아웃 확인
   - 콘솔 에러 없음 확인
5. .env 설정 안내
   - .env.example 내용 확인
   - 필요 시 간단한 사용법 주석을 App.jsx 상단에 추가

**검증 기준:**
- 360px 뷰포트에서 지도가 전체 화면으로 표시되고 하단 시트가 동작한다
- 1920px 뷰포트에서 좌측 사이드바 + 우측 지도 레이아웃이 표시된다
- 모바일에서 ObstacleForm이 전체 화면 모달로 열린다
- 모든 터치 타겟이 44px 이상이다
- `npm run build` 가 에러 없이 완료된다
- `npm run dev` 로 전체 기능이 정상 동작한다

**산출물:** 전체 CSS 파일 수정, App.jsx/App.css 최종 수정

---

## 파이프라인 흐름

```
Plan (현재 단계 - 완료)
  ↓
Design (designer: 퍼블리싱 HTML/CSS 설계)
  ↓
Execute (executor: 6단계 순차 구현)
  ↓
Review (reviewer: 코드 품질/보안 리뷰)
  ↓
Verify (verifier: 빌드/테스트 통과 확인)
  ↓
Commit (git-master: 커밋)
```

## 기술 참고사항

- **네이버지도 스크립트 로드**: Vite 환경에서 index.html의 `%ENV_VAR%` 치환이 지원되지 않으므로, JS에서 동적으로 스크립트 태그를 생성하여 로드하는 방식을 사용한다.
- **UUID 생성**: `crypto.randomUUID()` 사용 (모던 브라우저 지원). 폴리필 불필요.
- **마커 커스텀 아이콘**: `naver.maps.Marker`의 `icon` 속성에 SVG 데이터 URI 또는 HTML content를 사용하여 색상을 동적으로 지정한다.
- **InfoWindow 내 이벤트**: InfoWindow content에 HTML 문자열을 넣고, 열린 후 DOM에서 이벤트를 바인딩하거나, React Portal을 활용하는 방식을 검토한다.
