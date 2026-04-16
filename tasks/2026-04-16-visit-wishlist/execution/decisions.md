# 미적 결정 — visit-wishlist 디자인

## 미적 방향성

### Tone
기존 앱(네이비 #2D3E50 기반, 무채색 카드)의 차분하고 실용적인 톤을 유지.
위시리스트는 파란 계열(#3B82F6)로 장애물(레드/주황)과 명확히 구분.

### Differentiation
- 장애물 모드: 빨간/주황 위험 표시 계열 (기존 유지)
- 위시리스트 모드: 파란 계열(#3B82F6) — 방문 희망·기대감
- 방문 완료 상태: 금색/주황(#F59E0B) — 달성·완료감

## 컴포넌트별 결정

### Header 탭
- 탭을 pills 형태로 헤더 내부에 삽입 (별도 탭바 없음 → 높이 유지)
- 모바일(≤480px): brandText 숨기고 탭이 flex:1로 확장

### WishlistForm
- ObstacleForm의 overlay/panel/form 패턴 그대로 재사용
- 저장 버튼만 위험도 레드 대신 위시리스트 블루(#3B82F6)로 교체
- 위도/경도 필드: 읽기전용 스타일(bg:#F5F7FA) 별도 추가

### WishlistList
- MarkerList의 검색박스 + 목록 패턴 재사용
- 위에 필터 바 2단 추가 (카테고리 / 방문여부)
- 아이템 아이콘: 카테고리별 이모지 (36×36 라운드 박스)
- 방문 완료 배지: 금색 계열 / 미방문 배지: 회색 계열

### WishlistDetail
- ObstacleForm 패널 구조 기반 확장 (overlay → panel)
- 방문 카드: 금색 배경 / 미방문 시 회색 배경으로 전환
- 후기 폼: visitCount=0 이면 disabled 처리
- 후기 목록: bg:#F5F7FA 카드, 방문번호 배지 포함
