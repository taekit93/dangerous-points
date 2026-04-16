# 코드 리뷰 — 네이버지도 기반 장애물 등록 서비스

**리뷰어:** reviewer (opus)
**리뷰일:** 2026-04-16
**대상:** `.worktrees/naver-map-impl/src/` 전체

---

## Critical

### C-1. Map.jsx useEffect 의존성 배열에 콜백 함수 누락 (stale closure)

**파일:** `src/components/Map.jsx` 47-61행, 64-87행, 90-137행

세 개의 useEffect 모두 의존성 배열이 불완전하다.

- 첫 번째 useEffect(`[]`): `onMapClick`을 캡처하지만 의존성에 포함하지 않는다. App에서 `handleMapClick`이 렌더마다 새로 생성되므로, 지도 click 리스너가 항상 최초 렌더의 `onMapClick`을 호출한다. `setFormState`와 `setActiveMarkerId`가 함수형 업데이터가 아닌 값 기반이므로, `obstacles` 등 다른 state가 바뀌어도 클로저 안의 참조는 갱신되지 않는다. 현재 `handleMapClick`은 외부 state를 읽지 않으므로 실질적 버그는 아니지만, 향후 로직 변경 시 디버깅이 극히 어려운 stale closure 버그로 전이된다.

- 두 번째 useEffect(`[obstacles, mapReady]`): `onMarkerClick`이 의존성에 없다. 새 마커 생성 시 등록하는 click 리스너가 최초 참조의 `onMarkerClick`만 캡처한다. `handleMarkerClick` 안에서 `obstacles.find()`를 호출하므로, obstacles가 변경된 후 이전에 생성된 마커의 클릭 핸들러는 **이전 obstacles 배열**에서 검색한다. `mapRef.current.panTo` 호출 시 잘못된 좌표로 이동하거나 obstacle을 찾지 못할 수 있다.

- 세 번째 useEffect(`[activeMarkerId, mapReady]`): `allObstacles`, `onCloseInfoWindow`, `onEditObstacle`, `onDeleteObstacle`가 의존성에 없다. `allObstacles`가 변경되어도 InfoWindow 내용이 갱신되지 않는다.

**권고:**
1. 콜백 props를 App.jsx에서 `useCallback`으로 감싸거나,
2. Map.jsx 내부에서 ref를 사용해 최신 콜백을 추적하는 패턴(useLatestRef)을 적용하거나,
3. 네이버지도 리스너를 매번 제거/재등록하는 cleanup을 추가한다.

### C-2. Map.jsx 첫 번째 useEffect에 cleanup 함수 없음 — script 태그 누수

**파일:** `src/components/Map.jsx` 47-61행

`document.head.appendChild(script)` 이후 cleanup이 없다. React.StrictMode에서 개발 시 이 effect가 두 번 실행되어 스크립트 태그가 중복 삽입된다. 지도 인스턴스도 cleanup되지 않으므로 HMR 시 이전 지도가 남는다. 또한 지도 click 리스너도 해제되지 않는다.

**권고:**
```js
useEffect(() => {
  // ... 기존 로직 ...
  return () => {
    if (mapRef.current) {
      mapRef.current.destroy()
      mapRef.current = null
    }
  }
}, [])
```

### C-3. window 전역 함수 오염 — 동시 InfoWindow 간 충돌 및 보안 표면

**파일:** `src/components/Map.jsx` 118-120행

```js
window.__closeInfoWindow__ = () => onCloseInfoWindow()
window.__editObstacle__ = (id) => onEditObstacle(id)
window.__deleteObstacle__ = (id) => onDeleteObstacle(id)
```

문제점:
1. 전역 네임스페이스 오염: 같은 페이지에 여러 Map 컴포넌트가 렌더링되면 마지막 인스턴스의 핸들러만 동작한다.
2. 보안 표면: 브라우저 DevTools에서 `window.__deleteObstacle__('임의id')`를 직접 호출할 수 있다. localStorage 기반이라 서버사이드 인증이 없으므로, 이것이 직접적인 데이터 손실로 이어진다.
3. cleanup 부재: 컴포넌트 언마운트 시 전역 함수가 남아있어 이전 클로저의 `onDeleteObstacle` 등을 참조한다.

**권고:** 네이버 InfoWindow의 HTML 문자열 제약상 완전한 해결은 어렵지만, 다음을 적용할 것:
- 컴포넌트 언마운트 시 `delete window.__editObstacle__` 등으로 전역 함수 제거
- `window.__deleteObstacle__` 내부에 confirm 로직 포함 (현재 App.jsx의 handleDeleteObstacle에만 있음 — InfoWindow의 삭제 버튼은 confirm 없이 바로 삭제됨)

---

## Major

### M-1. 마커 이벤트 리스너 미해제 — 메모리 누수

**파일:** `src/components/Map.jsx` 64-87행 (마커 동기화 useEffect)

새 마커 생성 시 `naver.maps.Event.addListener(marker, 'click', ...)`를 호출하지만, 마커가 더 이상 표시되지 않을 때 리스너를 해제하지 않는다. `marker.setVisible(false)`는 리스너를 제거하지 않는다. obstacles가 삭제되어 마커가 제거될 때(App.jsx handleDeleteObstacle에서 `marker.setMap(null)`) 리스너 해제 코드가 없다.

**권고:** 리스너 참조를 별도 ref(Map)에 저장하고, 마커 제거 시 `naver.maps.Event.removeListener(listenerRef)`를 호출한다.

### M-2. 마커 동기화 useEffect에서 전체 obstacles 외의 마커가 정리되지 않음

**파일:** `src/components/Map.jsx` 64-87행

이 effect는 `obstacles`(filteredObstacles)를 기반으로 동작한다. 필터 해제 후 다시 필터를 적용하면 visibility만 토글하므로 문제없지만, **장애물이 삭제될 때의 마커 정리가 두 곳에서 분산**되어 있다:
- App.jsx `handleDeleteObstacle` (58-67행): `markersRef.current[id].setMap(null)` + `delete`
- Map.jsx useEffect: visibility만 관리

이 이중 관리는 버그 소지가 있다. 예를 들어, 삭제된 obstacle의 id가 filteredObstacles에 포함되지 않으므로 `marker.setVisible(false)`가 호출되지만, App.jsx에서 이미 `setMap(null)` + `delete`를 했으므로 해당 마커는 `markersRef.current`에 없어 `Object.entries` 순회에서 빠진다. 현재는 우연히 동작하지만, 삭제 흐름이 두 곳에서 관리되는 것은 유지보수 위험이다.

**권고:** 마커 생명주기 관리를 Map.jsx 내부의 useEffect로 일원화한다. App.jsx에서 `markersRef`를 직접 조작하지 않도록 한다.

### M-3. ObstacleForm의 useEffect 의존성 불완전

**파일:** `src/components/ObstacleForm.jsx` 24-30행

```js
useEffect(() => {
  if (errors.title && title) setErrors((prev) => ({ ...prev, title: null }))
}, [title])

useEffect(() => {
  if (errors.dangerLevel && dangerLevel) setErrors((prev) => ({ ...prev, dangerLevel: null }))
}, [dangerLevel])
```

`errors`가 의존성 배열에 누락되어 있다. `errors`가 바뀌어도 이 effect는 재실행되지 않는다. 실질적으로는 `errors`를 설정한 직후 `title`/`dangerLevel`이 바뀔 때만 의미있으므로 현재 동작에 문제는 없지만, ESLint `react-hooks/exhaustive-deps` 규칙 위반이다.

**권고:** `errors`를 의존성에 추가하거나, errors 초기화 로직을 `onChange` 핸들러 안으로 이동한다. 후자가 더 명시적이다.

### M-4. localStorage save() 시 예외 처리 없음

**파일:** `src/utils/storage.js` 12행

```js
function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
```

localStorage가 가득 찼거나(5MB 초과), private 브라우징 모드에서 쓰기가 차단되면 예외가 발생한다. 현재 `save()`를 호출하는 `create`, `update`, `remove` 함수 어디에서도 이 예외를 잡지 않으므로, React state는 업데이트되었지만 localStorage에는 저장되지 않는 불일치가 발생한다.

**권고:**
```js
function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('[storage] 저장 실패:', e)
    // 선택적으로 사용자에게 알림
  }
}
```

---

## Minor

### m-1. FilterBar에서 allCategories 계산이 매 렌더마다 실행됨

**파일:** `src/components/FilterBar.jsx` 11-12행

```js
const registeredCategories = obstacles.map((o) => o.category)
const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...registeredCategories])]
```

`obstacles`가 변경되지 않아도 매 렌더마다 Set 생성 + 배열 스프레드가 실행된다. `useMemo`로 감싸면 불필요한 계산을 방지할 수 있다. 현재 규모에서는 성능 영향이 미미하나, 데이터가 늘어나면 의미있는 최적화가 된다.

**권고:** `useMemo(() => ..., [obstacles])` 적용.

### m-2. escapeHtml 함수가 Map.jsx 컴포넌트 외부에 로컬 정의됨

**파일:** `src/components/Map.jsx` 162-169행

`escapeHtml`은 범용 유틸리티 함수이므로 `utils/` 디렉토리에 분리하고, 테스트를 추가하는 것이 바람직하다. 현재는 Map.jsx에서만 사용되지만, 향후 다른 곳에서 HTML 이스케이프가 필요할 때 중복 구현을 방지한다.

**권고:** `src/utils/escapeHtml.js`로 분리하고 단위 테스트 추가.

### m-3. storage.js의 update()가 존재하지 않는 id에 대해 undefined를 반환

**파일:** `src/utils/storage.js` 32-38행

```js
export function update(id, data) {
  const items = load()
  const updated = items.map((item) =>
    item.id === id ? { ...item, ...data, id, updatedAt: new Date().toISOString() } : item
  )
  save(updated)
  return updated.find((item) => item.id === id)
}
```

존재하지 않는 id로 호출하면 `.find()`가 `undefined`를 반환한다. `useObstacles.updateObstacle`에서 이 값을 `prev.map((o) => (o.id === id ? updated : o))`로 사용하므로, 일치하는 항목이 없어 `undefined`로 교체되는 일은 없지만, `updated`가 `undefined`인 상태로 map 콜백의 삼항 연산자가 항상 원본 `o`를 반환하므로 "조용한 실패"가 된다.

**권고:** 존재하지 않는 id에 대해 명시적으로 `null`을 반환하거나, 호출부에서 방어 코드를 추가한다.

### m-4. Map 컴포넌트에 PropTypes 또는 TypeScript 타입 정의 없음

**파일:** 모든 컴포넌트

모든 컴포넌트가 props 타입 검증 없이 사용되고 있다. JSX 프로젝트이므로 TypeScript는 아니지만, `prop-types` 패키지를 통한 런타임 타입 검증도 없다.

**권고:** 최소한 Map.jsx처럼 props가 많은 컴포넌트에는 PropTypes를 추가한다. 또는 JSDoc `@param` 어노테이션을 추가하여 에디터 수준의 타입 힌트를 제공한다.

### m-5. InfoWindow의 삭제 버튼이 App.jsx의 confirm 대화상자를 우회할 수 있음

**파일:** `src/components/Map.jsx` 120행 vs `src/App.jsx` 58-67행

InfoWindow의 삭제 버튼 onclick은 `window.__deleteObstacle__(id)`를 호출하고, 이것은 `onDeleteObstacle(id)` 즉 `handleDeleteObstacle(id)`로 연결된다. `handleDeleteObstacle`에는 `window.confirm` 체크가 있으므로 현재는 문제없다. 그러나 DevTools에서 직접 호출 시에도 confirm이 동작하므로 이 부분은 현재 올바르게 동작한다.

다만, MarkerList의 삭제 버튼(MarkerList.jsx 62행)도 같은 `onDelete` prop을 사용하므로 confirm이 동작한다. 이 점은 일관적이다.

**상태:** 재확인 결과 이슈 아님. confirm이 양쪽 모두에서 동작함.

---

## Info

### I-1. `crypto.randomUUID()` 브라우저 호환성

**파일:** `src/utils/storage.js` 23행

`crypto.randomUUID()`는 Secure Context(HTTPS 또는 localhost)에서만 동작한다. HTTP로 배포 시 에러가 발생한다. 현재 개발 환경(localhost)에서는 문제없다.

### I-2. 네이버 API 스크립트 로드 실패 처리 미비

**파일:** `src/components/Map.jsx` 47-61행

`script.onerror` 핸들러가 없다. API 키가 잘못되었거나 네트워크 오류 시 사용자에게 피드백이 없고, `mapReady`가 영원히 `false`로 남는다.

**권고:** `script.onerror`에서 에러 상태를 설정하고 사용자에게 안내 메시지를 표시한다.

### I-3. ADR 검토 소견

`plan/adr.md`의 6개 결정 모두 합리적이며 보완이 필요한 사항은 없다. 특히:
- localStorage 선택(결정 2)에서 5MB 한계와 이미지 제외를 명시한 점이 좋다.
- 카테고리+위험도 이중 분류(결정 4)가 구현에 정확히 반영되었다.
- 백업 제외(결정 6)로 스코프를 적절히 관리했다.

### I-4. 테스트 커버리지 양호

37개 테스트가 모두 통과하며, storage/hook/component 각 레이어를 커버한다. 다만 Map.jsx는 네이버 API 의존성 때문에 테스트가 없다. 이는 통합테스트 또는 E2E 테스트로 보완 가능하다.

---

## 보안 체크리스트 결과

| 항목 | 결과 | 비고 |
|------|------|------|
| XSS: InfoWindow escapeHtml 적용 | PASS | category, title, description, dangerLevel 모두 이스케이프됨 |
| XSS: obstacle.id가 onclick에 삽입됨 | PASS | id는 crypto.randomUUID()로 생성되어 UUID 형식 고정 |
| localStorage 파싱 예외처리 | PASS | load()에 try-catch 적용됨 |
| localStorage 저장 예외처리 | FAIL | save()에 try-catch 없음 (M-4) |
| 전역 함수 노출 위험 | WARN | window.__deleteObstacle__ 등 (C-3) |
| 환경변수 노출 | PASS | VITE_ 접두사로 클라이언트 사이드 노출 의도적이며, API 키만 포함 |
| 의존성 취약점 | N/A | node_modules 미확인 (빌드 통과 확인됨) |

---

## 전체 평가

**등급: B+**

전반적으로 잘 구조화된 코드베이스이다. 컴포넌트 분리, CSS Modules 활용, 테스트 커버리지, XSS 방어가 적절하다. ADR의 결정사항이 구현에 정확히 반영되었다.

주요 개선 필요 사항:
1. **useEffect 의존성 배열 정비** (C-1) -- stale closure 위험이 가장 큰 기술적 부채
2. **마커 이벤트 리스너 cleanup** (C-2, M-1) -- 메모리 누수 방지
3. **전역 함수 cleanup** (C-3) -- 컴포넌트 언마운트 시 제거
4. **localStorage save 예외처리** (M-4) -- 저장 실패 시 데이터 불일치 방지

Critical 3건, Major 4건 발견으로 **executor에게 수정을 요청**한다. Minor/Info는 이번 스코프에서 선택적이다.
