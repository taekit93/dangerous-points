# 의사결정 로그 — GeoJSON 장애물 임포트

**작성일:** 2026-04-17

---

## [Design] 09:34 — designer

### 미적 방향 결정

1. **톤 & 색상:** 기존 `ObstacleForm` 모달과 완전히 동일한 딥네이비(`#2D3E50`) 기반 유지.
   GeoJSON/파일 관련 요소에만 파란색(`#3B82F6`, info 계열) 악센트 사용.
   보라 그라디언트/흰 배경 조합 금지 원칙 준수.

2. **진입점 위치:** Header 우측에 "GeoJSON 가져오기" 버튼 배치.
   기존 `count` 배지 옆에 추가하여 Header 내 맥락 유지.
   근거: DrawToolbar는 드로잉 모드 전용이므로 임포트(데이터 주입) 동작과 책임 분리.

3. **탭 UI 선택:** 별도 페이지 이동 없이 모달 내 탭(텍스트 입력/파일 업로드) 방식 채택.
   근거: 두 입력 방식의 결과물(파싱 결과, 메타폼)이 동일하므로 단일 모달로 통합이 적절.

4. **파싱 결과 영역:** 성공/오류/경고 3상태로 색상 코딩 (초록/빨강/주황).
   geometry chip 색상: Point=파랑, LineString=보라, Polygon=앰버 — 지도 레이어 관례 반영.

5. **메타폼 자동매핑 힌트:** `↩ properties.xxx 자동 매핑됨` 표시로 사용자에게 매핑 근거 노출.
   Feature 다수 시 제목 자동생성 안내 박스 별도 표시.

6. **푸터 스티키:** 긴 폼 스크롤 시에도 "N개 장애물 등록" 버튼이 항상 노출되도록 `position: sticky; bottom: 0` 적용.

7. **신규 CSS 토큰:** `--color-info`, `--color-info-bg`, `--color-success`, `--color-success-bg` 4종 추가.
   기존 variables.css에 병합 필요 (executor 단계에서 처리).
