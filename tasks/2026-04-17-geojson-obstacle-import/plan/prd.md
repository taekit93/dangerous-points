# PRD — GeoJSON 장애물 임포트

**작성일:** 2026-04-17
**작성자:** planner
**상태:** 확정

## 목적
GeoJSON 데이터를 직접 텍스트로 입력하거나 .geojson/.json 파일을 업로드하여 장애물(obstacle)을 일괄 등록하는 기능을 추가한다. 현재는 지도를 클릭하여 한 건씩 등록하는 방식만 가능한데, 외부 데이터(측량 데이터, 공공 데이터 등)를 빠르게 반영할 수 있도록 한다.

## 대상 사용자
- 기존 장애물 데이터를 보유한 관리자
- 공공 데이터(GeoJSON 형식)를 활용하려는 사용자
- 여러 장애물을 한 번에 등록하려는 사용자

## 핵심 요구사항

### 기능 요구사항 (반드시 구현)
1. **GeoJSON 입력 방식 2가지**: 파일 업로드(.geojson/.json) + 텍스트 직접 입력(textarea) 모두 지원
2. **GeoJSON 파싱 및 검증**: 유효한 GeoJSON인지 검증, Feature/FeatureCollection 지원
3. **지원 geometry 타입**: Point, LineString, Polygon (기존 obstacle 타입 point/line/polygon에 매핑)
4. **FeatureCollection 처리**: 여러 Feature가 포함된 FeatureCollection은 한 번에 전체 등록. 공통 메타데이터 폼으로 일괄 속성 적용
5. **속성 자동 매핑**: GeoJSON properties에서 title, category, dangerLevel, description 자동 추출 (없으면 빈칸/기본값)
6. **미리보기**: 파싱 결과를 확인할 수 있는 프리뷰 (건수, geometry 타입별 분포)
7. **일괄 등록**: 파싱된 Feature들을 장애물로 일괄 저장
8. **중복 처리**: 중복 검사 없이 그대로 등록 (동일 좌표 장애물도 별도 항목으로 저장)

### 비기능 요구사항
- 대량 데이터(100건 이상) 입력 시 UI 블로킹 방지
- 잘못된 GeoJSON 입력 시 명확한 에러 메시지
- 기존 장애물 등록 흐름(지도 클릭 방식)에 영향 없음

## 범위

### In Scope
- GeoJSON 임포트 UI (모달 형태)
- GeoJSON 파싱 유틸리티 함수 (`src/utils/geojson.js`)
- 파일 업로드(FileReader API) 처리
- GeoJSON -> obstacle 데이터 변환 로직
- 임포트 프리뷰 (건수, 타입 요약)
- 공통 메타데이터 폼 (FeatureCollection 전체에 적용)
- 일괄 저장 처리
- 임포트 버튼 (DrawToolbar 영역에 배치)

### Out of Scope
- GeoJSON 내보내기(export) 기능
- KML, Shapefile 등 다른 포맷 지원
- 서버 업로드 (현재 localStorage 기반 유지)
- 드래그앤드롭 파일 업로드
- MultiPoint, MultiLineString, MultiPolygon 지원 (기본 3종만)
- 중복 검사 로직
- 임포트 전 개별 Feature 속성 편집

## 구현 범위 (파일 단위)

### 새로 생성
- `src/components/GeoJsonImportModal.jsx` — 임포트 모달 컴포넌트
- `src/utils/geojson.js` — GeoJSON 파싱/검증/변환 유틸리티

### 수정
- `src/App.jsx` — 임포트 버튼/모달 상태 연결
- `src/hooks/useObstacles.js` — 배치(batch) 등록 메서드 추가

## GeoJSON -> 내부 모델 변환 규칙

| GeoJSON Geometry | obstacle type | coordinates 변환 |
|-----------------|---------------|-----------------|
| Point | "point" | [lng, lat] -> { lat, lng } |
| LineString | "line" | [[lng, lat], ...] -> [{ lat, lng }, ...] |
| Polygon | "polygon" | 외곽 링(첫 번째 배열)만 사용 |

### properties 자동 매핑 우선순위
- title: properties.title -> properties.name -> properties.제목 -> ""
- category: properties.category -> properties.카테고리 -> ""
- dangerLevel: properties.dangerLevel -> properties.danger -> properties.위험도 -> ""
- description: properties.description -> properties.설명 -> ""
- 매핑 실패 시 빈칸으로 두고, 공통 메타데이터 폼에서 사용자가 채울 수 있음

## 성공 기준
1. GeoJSON 텍스트를 textarea에 붙여넣으면 유효성 검증 후 장애물로 등록된다
2. .geojson/.json 파일을 선택하면 파싱하여 장애물로 등록된다
3. Point, LineString, Polygon 타입이 각각 point, line, polygon 장애물로 올바르게 매핑된다
4. FeatureCollection의 모든 Feature가 한 번에 등록된다
5. 잘못된 GeoJSON 입력 시 에러 메시지가 표시된다
6. 기존 테스트가 깨지지 않고 새로 추가된 유틸리티에 대한 테스트가 존재한다
