# 실행 로그 — 네이버지도 기반 장애물 등록 서비스

## [Design] 09:00 — designer

implementation-plan.md, prd.md, FORMATS.md를 읽고 디자인 작업 시작.

**생성 파일:**
- `plan/design-spec.md`: 디자인 시스템 확정값, 컴포넌트 스펙, CSS 아키텍처(CSS Modules 채택), 반응형 브레이크포인트, 컴포넌트 트리 구조
- `plan/design/style.css`: CSS Custom Properties 전역 선언 + Reset + 유틸리티 클래스
- `plan/design/layout.css`: 헤더, 사이드바, 지도 영역, 하단 시트 레이아웃
- `plan/design/components.css`: FilterBar, MarkerList, ObstacleForm, InfoWindow, 버튼 컴포넌트
- `plan/design/index.html`: 데스크탑 전체 레이아웃 (사이드바 + 지도 + InfoWindow 예시)
- `plan/design/mobile.html`: 모바일 레이아웃 (360px 프리뷰 + 하단 시트)
- `plan/design/form.html`: ObstacleForm 상태 모음 (등록/수정/에러/직접입력/모바일시트)
- `plan/design/infowindow.html`: InfoWindow, 마커, 배지, 색상 팔레트 모음

**pipeline.json:** stage → design, designApproved → false

## [Execute] 09:44 — executor

worktree `task/naver-map-impl` 에서 전체 신규 파일 생성 완료.

**생성 파일:**
- `index.html`, `vite.config.js`, `package.json`, `.env.example`
- `src/main.jsx`, `src/App.jsx`, `src/App.module.css`
- `src/styles/`: `variables.css`, `reset.css`, `global.css`, `info-window.css`
- `src/constants/categories.js`
- `src/utils/storage.js`
- `src/hooks/useObstacles.js`
- `src/components/`: `Header`, `FilterBar`, `Map`, `MarkerList`, `ObstacleForm` + 각 module.css
- `src/test/`: `setup.js`, `storage.test.js`, `useObstacles.test.js`, `categories.test.js`, `FilterBar.test.jsx`, `MarkerList.test.jsx`, `ObstacleForm.test.jsx`

**빌드 결과:**
```
vite v6.4.2 building for production...
✓ 44 modules transformed.
dist/index.html   0.55 kB
dist/assets/index.css  13.00 kB
dist/assets/index.js   159.15 kB
✓ built in 498ms
```

**테스트 결과:**
```
Test Files  6 passed (6)
     Tests  37 passed (37)
```

**pipeline.json:** stage → execute, worktreePath → .worktrees/naver-map-impl

## [Verify] 09:46 — verifier

worktree `j:/KHT/Study/Harness-Test/dangerous-points/.worktrees/naver-map-impl` 에서 전체 검증 완료.

**빌드 결과:**
```
vite v6.4.2 building for production...
✓ 44 modules transformed.
dist/index.html                 0.55 kB │ gzip: 0.37 kB
dist/assets/index-BnoDM6Od.css 13.00 kB │ gzip: 3.14 kB
dist/assets/index-B1XZ-upl.js 159.15 kB │ gzip: 51.68 kB
✓ built in 482ms
```

**테스트 결과:**
```
Test Files  6 passed (6)
     Tests  37 passed (37)
  Duration  1.54s
```

**파일 구조:** src/components/(5개), src/styles/(4개), categories.js, storage.js, .env.example 전부 존재.

**open-questions.md:** [미결] 항목 0개 (Map.jsx 실제 API 연동 확인 후 갱신).

**pipeline.json:** stage → verify, verified → true, mergeable → true

## [Review] 09:46 — reviewer

`.worktrees/naver-map-impl/src/` 전체 소스 코드에 대한 품질/보안/설계 리뷰 수행.

**발견 사항:**
- Critical 3건: useEffect 의존성 배열 불완전(stale closure), cleanup 함수 부재, window 전역 함수 오염
- Major 4건: 마커 이벤트 리스너 미해제, 마커 생명주기 이중 관리, ObstacleForm useEffect 의존성 누락, localStorage save 예외처리 없음
- Minor 5건, Info 4건

**보안 체크리스트:** XSS escapeHtml 적용 확인(PASS), localStorage 파싱 예외처리 확인(PASS), localStorage 저장 예외처리 미비(FAIL), 전역 함수 노출(WARN)

**ADR 검토:** 6개 결정 모두 합리적, 보완 불필요.

**판정:** Critical/Major 이슈 존재 -- stage를 "execute"로 되돌리고 executor에게 수정 요청.

**산출물:** `execution/review.md`

**pipeline.json:** stage → execute (이슈 발견으로 되돌림)

## [Execute] 09:51 — executor

코드 리뷰 Critical/Major 이슈 수정 완료.

**수정 파일:**
- `src/components/Map.jsx`: C-1 stale closure 해결(onMarkerClick 등 ref 패턴), C-2 StrictMode cleanup(cancelled flag + existingScript 중복 방지), C-3 window 전역 함수 cleanup, M-1 리스너 핸들 저장({ marker, listener } 구조)
- `src/App.jsx`: M-1 markersRef 구조 변경 반영 — marker.setMap(null) → entry.marker + Event.removeListener
- `src/utils/storage.js`: M-4 save() try-catch 추가
- `src/components/ObstacleForm.jsx`: M-3 useEffect deps에 errors.title, errors.dangerLevel 추가

**빌드 결과:**
```
vite v6.4.2 building for production...
✓ 44 modules transformed.
dist/index.html                 0.55 kB │ gzip:  0.36 kB
dist/assets/index-BnoDM6Od.css 13.00 kB │ gzip:  3.14 kB
dist/assets/index-Ce728vDs.js  160.30 kB │ gzip: 52.11 kB
✓ built in 492ms
```

**테스트 결과:**
```
Test Files  6 passed (6)
     Tests  37 passed (37)
  Duration  1.70s
```

## [Review] 10:12 — reviewer

`src/components/Map.jsx` Polyline/Polygon `clickable: true` 버그픽스 리뷰.

**변경 사항:** Line 198, Line 216에 `clickable: true` 추가 (각 1줄, 총 2줄).

**리뷰 결과: LGTM**

1. **수정 정확성 (PASS):** 네이버 Maps JavaScript API v3에서 Polyline/Polygon의 `clickable` 기본값은 `false`이다. click 이벤트 리스너를 등록하려면 반드시 `clickable: true`를 명시해야 한다. Marker는 기본값이 `true`이므로 별도 설정이 불필요하다. 수정이 정확하다.
2. **동일 패턴 점검 (PASS):** 프리뷰 Polyline(Line 127-134)과 프리뷰 Polygon(Line 136-145)은 click 리스너가 등록되지 않은 드로잉 중 시각 피드백 전용 오버레이이므로 `clickable: true`가 불필요하다. Marker(Line 224-228)는 API 기본값이 `true`이므로 문제없다. 누락 없음.
3. **최소 diff 준수 (PASS):** 총 변경 2줄 추가, 0줄 삭제. 버그 수정에 필요한 최소한의 변경만 포함.

**이슈:** 0건.
