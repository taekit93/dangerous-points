# 기능 리스트 — GeoJSON 장애물 임포트

**작성일:** 2026-04-17

| 기능 | 우선순위 | 설명 | 완료 |
|------|---------|------|------|
| GeoJSON 파싱 유틸리티 | P0 | `src/utils/geojson.js` — GeoJSON 문자열 파싱, 유효성 검증, Feature/FeatureCollection 지원. Point/LineString/Polygon을 obstacle 형식으로 변환 | [ ] |
| GeoJSON 텍스트 입력 | P0 | textarea에 GeoJSON 문자열을 직접 붙여넣어 임포트하는 UI | [ ] |
| GeoJSON 파일 업로드 | P0 | .geojson/.json 파일을 file input으로 선택하여 FileReader API로 파싱 | [ ] |
| FeatureCollection 일괄 등록 | P0 | 여러 Feature가 포함된 FeatureCollection을 한 번에 전체 등록. 중복 검사 없이 그대로 저장 | [ ] |
| 공통 메타데이터 폼 | P0 | FeatureCollection 전체에 적용할 공통 속성(category, dangerLevel 등)을 입력하는 폼. properties 자동 매핑 결과가 없을 때 이 값으로 채움 | [ ] |
| 임포트 프리뷰 | P0 | 파싱 결과 요약 표시 (총 건수, geometry 타입별 분류) | [ ] |
| 임포트 모달 UI | P0 | `GeoJsonImportModal.jsx` — 텍스트 입력 + 파일 업로드를 담는 모달 컴포넌트 | [ ] |
| 일괄 저장 (배치 등록) | P0 | `useObstacles.js`에 배치 등록 메서드 추가. 프리뷰 확인 후 일괄 저장 | [ ] |
| 속성 자동 매핑 | P1 | GeoJSON properties에서 title/category/dangerLevel/description 우선순위 기반 자동 추출. 매핑 실패 시 빈칸 | [ ] |
| 임포트 진입점 | P1 | DrawToolbar에 "GeoJSON 임포트" 버튼 추가하여 모달 열기 | [ ] |
| 에러 처리 | P1 | 유효하지 않은 GeoJSON, 지원하지 않는 geometry 타입(Multi 계열 등)에 대한 명확한 에러 메시지 | [ ] |
| 테스트 | P1 | GeoJSON 파싱 유틸리티(`src/utils/geojson.js`)에 대한 단위 테스트 | [ ] |

P0: 반드시 구현 / P1: 중요 / P2: 선택
