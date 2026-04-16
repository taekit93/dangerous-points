# ADR — Line/Polygon 장애물 타입 추가

**작성일:** 2026-04-16
**작성자:** planner (초안) / reviewer (검토 후 보완)

## 결정 1: 좌표 입력 방식 — 순차 클릭 방식

**상태:** 제안

**맥락**
Line과 Polygon 타입은 여러 좌표가 필요하다. 사용자가 지도에서 어떻게 좌표를 입력할지 결정해야 한다.

**결정**
지도 위에서 순차적으로 클릭하여 좌표를 하나씩 추가하는 방식을 채택한다. 화면 상단 또는 하단에 '완료', '되돌리기(Undo)', '취소' 버튼을 제공한다. 좌표가 추가될 때마다 임시 Polyline/Polygon을 실시간 렌더링하여 미리보기를 제공한다.

**고려한 대안**
- 네이버 Drawing Manager 사용 — 현재 프로젝트에서 기본 API만 로드하고 있어 추가 스크립트 필요. 커스터마이징이 제한적. 거부.
- 드래그 기반 자유 그리기 — 구현 복잡도가 높고 정밀한 좌표 제어가 어려움. 거부.

**결과**
사용자는 모드 전환을 인지해야 한다 (일반 클릭 = Point 등록 vs 다중 클릭 모드 = Line/Polygon 좌표 수집). 모드 표시 UI가 필요하다.

---

## 결정 2: 데이터 모델 확장 전략 — type + coords 필드 추가

**상태:** 제안

**맥락**
기존 obstacle 객체는 `{ id, lat, lng, title, category, dangerLevel, description, createdAt, updatedAt }` 구조이다. Line/Polygon은 단일 lat/lng로는 표현할 수 없다.

**결정**
기존 필드를 유지하면서 `type`과 `coords` 필드를 추가한다.
- `type`: 'point' | 'line' | 'polygon' (기본값 'point')
- `coords`: Line/Polygon용 좌표 배열 `[{lat, lng}, {lat, lng}, ...]`
- Point 타입은 기존과 동일하게 `lat`, `lng` 사용. `coords`는 없거나 빈 배열.
- Line/Polygon 타입은 `coords`에 좌표 배열 저장. `lat`, `lng`에는 첫 번째 좌표(또는 중심점)를 저장하여 목록 표시 및 지도 panTo에 활용.

**고려한 대안**
- 별도 컬렉션으로 분리 — 필터링, 목록 표시 등에서 두 소스를 합쳐야 하는 복잡도 증가. 거부.
- lat/lng 대신 coords만 사용 — 기존 Point 데이터와의 하위 호환성 깨짐. 거부.

**결과**
기존 localStorage 데이터가 type 필드 없이도 정상 동작한다 (undefined → 'point'로 처리). 스키마 마이그레이션이 불필요하다.

---

## 결정 3: 오버레이 관리 — markersRef 확장

**상태:** 제안

**맥락**
현재 `markersRef`는 `{ [id]: { marker, listener } }` 구조로 Point 마커만 관리한다. Line/Polygon은 Marker가 아닌 Polyline/Polygon 객체이다.

**결정**
`markersRef`(이름은 `overlaysRef`로 변경 고려)를 확장하여 타입에 따라 다른 오버레이 객체를 저장한다.
```
{
  [id]: {
    type: 'point' | 'line' | 'polygon',
    overlay: Marker | Polyline | Polygon,
    listener: EventListener
  }
}
```

**고려한 대안**
- 별도 ref (polylinesRef, polygonsRef) 분리 — 삭제/표시/숨김 로직이 세 곳에 분산되어 유지보수 부담. 거부.

**결과**
Map.jsx의 오버레이 동기화 로직이 type에 따라 분기해야 한다. 기존 marker 관련 코드를 type === 'point' 분기 안에 유지하면 하위 호환성을 보장할 수 있다.

---

## 결정 4: 좌표 입력 모드 상태 관리

**상태:** 제안

**맥락**
Line/Polygon 등록 시 사용자가 여러 번 클릭해야 한다. 이 동안 일반 클릭(Point 등록)과 구분해야 한다. 또한 임시 좌표 배열과 미리보기 오버레이를 관리해야 한다.

**결정**
App.jsx에 `drawingMode` 상태를 추가한다.
- `null`: 일반 모드 (클릭 시 Point 등록 폼 열기)
- `{ type: 'line' | 'polygon', coords: [{lat, lng}, ...] }`: 그리기 모드
그리기 모드에서 지도 클릭 시 coords에 좌표 추가. '완료' 클릭 시 coords 확정 후 ObstacleForm으로 전환.

**고려한 대안**
- ObstacleForm 내부에서 관리 — 폼이 열려 있는 동안 지도 클릭 이벤트와의 연동이 복잡해짐. 거부.

**결과**
App.jsx의 handleMapClick이 drawingMode 유무에 따라 분기 동작한다.
