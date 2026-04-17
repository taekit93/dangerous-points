# 인사이트 — GeoJSON 장애물 임포트

작성: 2026-04-17 | git-master

## 기술 결정

### createBatch vs N회 create
- 리뷰어가 W-2로 지적한 N회 localStorage 쓰기 패턴은 배치 크기에 비례해 성능 저하를 유발한다.
- `storage.createBatch(dataList)`: load 1회 → items.push(all) → save 1회 패턴으로 개선.
- 향후 IndexedDB 또는 원격 API 전환 시에도 동일한 배치 인터페이스가 유리하다.

### properties 자동 매핑 설계
- GeoJSON 소스마다 키 이름이 다르다 (name/title/제목, danger_level/dangerLevel/위험도 등).
- 우선순위 폴백 체인(`properties.title ?? properties.name ?? properties['제목']`)이 실용적이다.
- 매핑 규칙을 `geojson.js` 내 헬퍼 함수로 분리하면 테스트 용이성이 높아진다.

### 탭 기반 모달 UX
- 텍스트 직접 입력과 파일 업로드를 단일 모달에 탭으로 통합하면 진입점을 최소화할 수 있다.
- 파싱 결과 미리보기(성공/오류/경고 3색 코딩)를 등록 전에 보여주면 사용자 신뢰도가 높아진다.

## 프로세스 인사이트

### ADR과 구현 불일치 관리
- I-1: DrawToolbar → Header 배치 변경이 ADR에 미반영된 채로 리뷰에 도달했다.
- 구현 중 설계 결정이 바뀔 때 ADR을 즉시 업데이트하는 습관이 필요하다.

### 스크린샷 검증 자동화
- verifier가 hasUI=true 조건에서 스크린샷을 필수 증거로 요구했다.
- Playwright 기반 `scripts/capture-screenshots.mjs`를 남겨두면 회귀 검증에 재사용할 수 있다.

### 사전 미결 질문 정리의 가치
- planner 단계에서 3건의 미결 질문(입력 방식/FeatureCollection 처리/중복 처리)을 사용자 확인으로 해결했다.
- 사전 결정이 없었다면 execute 단계에서 재작업이 발생했을 것이다.

## 재사용 가능한 패턴

- `storage.createBatch(dataList)` — 배치 등록 패턴, 다른 엔티티에도 적용 가능.
- `geojson.js` parseGeoJson/geoJsonToObstacles — GeoJSON 처리 유틸, 독립 모듈로 재사용 가능.
- Playwright 캡처 스크립트 (`scripts/capture-screenshots.mjs`) — UI 검증 자동화.
