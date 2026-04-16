# 기능 리스트 — Line/Polygon 장애물 타입 추가

**작성일:** 2026-04-16

| 기능 | 우선순위 | 설명 | 완료 |
|------|---------|------|------|
| 데이터 모델 확장 | P0 | obstacle 객체에 type('point'\|'line'\|'polygon') 및 coords(좌표 배열) 필드 추가. storage.js의 create/update 함수 수정. 기존 데이터 하위 호환(type 없으면 'point') | [ ] |
| 타입 선택 UI | P0 | ObstacleForm에 타입 선택 라디오/세그먼트 컨트롤 추가. 선택된 타입에 따라 좌표 입력 모드 전환 | [ ] |
| 다중 좌표 입력 모드 | P0 | Line/Polygon 선택 시 지도에서 순차 클릭으로 좌표 수집. 실시간 미리보기(임시 Polyline/Polygon). '완료' 버튼으로 좌표 확정, '취소' 및 '되돌리기(Undo)' 지원 | [ ] |
| Polyline 오버레이 렌더링 | P0 | Line 타입 장애물을 naver.maps.Polyline으로 렌더링. 위험도 기반 색상 적용. 클릭 시 InfoWindow 표시 | [ ] |
| Polygon 오버레이 렌더링 | P0 | Polygon 타입 장애물을 naver.maps.Polygon으로 렌더링. 위험도 기반 테두리+반투명 채우기 색상. 클릭 시 InfoWindow 표시 | [ ] |
| MarkerList 타입 표시 | P1 | 장애물 목록에서 타입별 아이콘/뱃지 표시 (점 아이콘, 선 아이콘, 면 아이콘) | [ ] |
| InfoWindow 타입 정보 | P1 | InfoWindow에 장애물 타입 뱃지 추가. Line/Polygon의 경우 좌표 개수 표시 | [ ] |
| Line/Polygon 수정 지원 | P1 | 기존 Line/Polygon 장애물의 메타데이터(제목, 카테고리, 위험도, 설명) 수정. 좌표 자체는 수정 불가(Out of Scope) | [ ] |
| 필터바 타입 필터 | P2 | FilterBar에 타입 필터 추가 (Point/Line/Polygon 필터링) | [ ] |
| 새 타입 테스트 추가 | P1 | Line/Polygon 장애물 생성, 저장, 렌더링에 대한 단위 테스트 추가 | [ ] |

P0: 반드시 구현 / P1: 중요 / P2: 선택
