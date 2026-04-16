import { useCallback, useEffect, useRef, useState } from 'react'
import { DANGER_COLORS } from '../constants/categories'
import DrawToolbar from './DrawToolbar'
import DrawStatusBar from './DrawStatusBar'
import styles from './Map.module.css'

export default function Map({
  mapRef,
  markersRef,
  obstacles,
  allObstacles,
  activeMarkerId,
  onMapClick,
  onMarkerClick,
  onCloseInfoWindow,
  onEditObstacle,
  onDeleteObstacle,
  coords,
  drawMode,
  onDrawModeChange,
  onDrawComplete,
  onDrawUndo,
  onDrawCancel,
  wishlistItems = [],
  onWishlistItemClick,
}) {
  const mapContainerRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const infoWindowRef = useRef(null)
  const previewPolylineRef = useRef(null)
  const previewPolygonRef = useRef(null)
  const wishlistMarkersRef = useRef({})

  // C-1: 외부 콜백을 ref로 감싸 최신 참조 유지
  const onMapClickRef = useRef(onMapClick)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onCloseInfoWindowRef = useRef(onCloseInfoWindow)
  const onEditObstacleRef = useRef(onEditObstacle)
  const onDeleteObstacleRef = useRef(onDeleteObstacle)
  const onWishlistItemClickRef = useRef(onWishlistItemClick)

  useEffect(() => { onMapClickRef.current = onMapClick }, [onMapClick])
  useEffect(() => { onMarkerClickRef.current = onMarkerClick }, [onMarkerClick])
  useEffect(() => { onCloseInfoWindowRef.current = onCloseInfoWindow }, [onCloseInfoWindow])
  useEffect(() => { onEditObstacleRef.current = onEditObstacle }, [onEditObstacle])
  useEffect(() => { onDeleteObstacleRef.current = onDeleteObstacle }, [onDeleteObstacle])
  useEffect(() => { onWishlistItemClickRef.current = onWishlistItemClick }, [onWishlistItemClick])

  const createMarkerIcon = useCallback((dangerLevel) => {
    const color = DANGER_COLORS[dangerLevel] || '#999'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>`
    return {
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      size: new window.naver.maps.Size(32, 40),
      anchor: new window.naver.maps.Point(16, 40),
    }
  }, [])

  const createWishlistMarkerIcon = useCallback((visitCount) => {
    const color = visitCount > 0 ? '#F59E0B' : '#3B82F6'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <polygon points="18,2 22.5,13 34,13 25,20.5 28.5,32 18,25 7.5,32 11,20.5 2,13 13.5,13" fill="${color}" stroke="white" stroke-width="1.5"/>
    </svg>`
    return {
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      size: new window.naver.maps.Size(36, 36),
      anchor: new window.naver.maps.Point(18, 18),
    }
  }, [])

  // C-2: StrictMode 중복 실행 방지 cleanup
  useEffect(() => {
    let cancelled = false
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID
    if (!clientId || clientId === 'your_client_id_here') {
      console.warn('[장애물 지도] VITE_NAVER_CLIENT_ID가 설정되지 않았습니다.')
      return
    }

    function initMap() {
      if (cancelled || !mapContainerRef.current) return
      const map = new window.naver.maps.Map(mapContainerRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 15,
      })
      mapRef.current = map
      window.naver.maps.Event.addListener(map, 'click', (e) => {
        onMapClickRef.current({ lat: e.coord.lat(), lng: e.coord.lng() })
      })
      setMapReady(true)
    }

    const existingScript = document.querySelector('script[src*="oapi.map.naver.com"]')
    if (existingScript) {
      if (window.naver?.maps) {
        initMap()
      } else {
        existingScript.addEventListener('load', initMap)
      }
      return () => { cancelled = true }
    }

    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`
    script.onload = () => { if (!cancelled) initMap() }
    document.head.appendChild(script)
    return () => { cancelled = true }
  }, [])

  // C-3: window 전역 함수 cleanup
  useEffect(() => {
    window.__closeInfoWindow__ = () => onCloseInfoWindowRef.current?.()
    window.__editObstacle__ = (id) => onEditObstacleRef.current?.(id)
    window.__deleteObstacle__ = (id) => onDeleteObstacleRef.current?.(id)
    return () => {
      delete window.__closeInfoWindow__
      delete window.__editObstacle__
      delete window.__deleteObstacle__
    }
  }, [])

  // 드로잉 프리뷰 오버레이
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    // 기존 프리뷰 제거
    if (previewPolylineRef.current) {
      previewPolylineRef.current.setMap(null)
      previewPolylineRef.current = null
    }
    if (previewPolygonRef.current) {
      previewPolygonRef.current.setMap(null)
      previewPolygonRef.current = null
    }

    if (!coords || coords.length === 0) return

    const path = coords.map((c) => new window.naver.maps.LatLng(c.lat, c.lng))

    if (drawMode === 'line' && coords.length > 0) {
      previewPolylineRef.current = new window.naver.maps.Polyline({
        map: mapRef.current,
        path,
        strokeColor: '#4A90D9',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        strokeStyle: 'dashed',
      })
    } else if (drawMode === 'polygon' && coords.length > 0) {
      previewPolygonRef.current = new window.naver.maps.Polygon({
        map: mapRef.current,
        paths: [path],
        fillColor: '#4A90D9',
        fillOpacity: 0.2,
        strokeColor: '#4A90D9',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        strokeStyle: 'dashed',
      })
    }

    return () => {
      if (previewPolylineRef.current) {
        previewPolylineRef.current.setMap(null)
        previewPolylineRef.current = null
      }
      if (previewPolygonRef.current) {
        previewPolygonRef.current.setMap(null)
        previewPolygonRef.current = null
      }
    }
  }, [coords, drawMode, mapReady])

  // C-1 + M-1: 마커/오버레이 동기화
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    // 기존 항목 중 현재 obstacles에 없는 것 숨기기
    Object.entries(markersRef.current).forEach(([id, entry]) => {
      const isVisible = obstacles.some((o) => o.id === id)
      if (entry.marker) {
        entry.marker.setVisible(isVisible)
      } else if (entry.polyline) {
        entry.polyline.setVisible(isVisible)
      } else if (entry.polygon) {
        entry.polygon.setVisible(isVisible)
      }
    })

    obstacles.forEach((obstacle) => {
      if (markersRef.current[obstacle.id]) {
        // 아이콘 업데이트 (point만)
        const entry = markersRef.current[obstacle.id]
        if (entry.marker) {
          entry.marker.setIcon(createMarkerIcon(obstacle.dangerLevel))
        }
        return
      }

      const color = DANGER_COLORS[obstacle.dangerLevel] || '#999'

      if (obstacle.type === 'line' && obstacle.coordinates?.length > 0) {
        const path = obstacle.coordinates.map(
          (c) => new window.naver.maps.LatLng(c.lat, c.lng)
        )
        const polyline = new window.naver.maps.Polyline({
          map: mapRef.current,
          path,
          strokeColor: color,
          strokeWeight: 4,
          strokeOpacity: 0.9,
          clickable: true,
        })
        const listener = window.naver.maps.Event.addListener(polyline, 'click', () =>
          onMarkerClickRef.current(obstacle.id)
        )
        markersRef.current[obstacle.id] = { polyline, listener }
      } else if (obstacle.type === 'polygon' && obstacle.coordinates?.length > 0) {
        const path = obstacle.coordinates.map(
          (c) => new window.naver.maps.LatLng(c.lat, c.lng)
        )
        const polygon = new window.naver.maps.Polygon({
          map: mapRef.current,
          paths: [path],
          fillColor: color,
          fillOpacity: 0.3,
          strokeColor: color,
          strokeWeight: 2,
          strokeOpacity: 0.9,
          clickable: true,
        })
        const listener = window.naver.maps.Event.addListener(polygon, 'click', () =>
          onMarkerClickRef.current(obstacle.id)
        )
        markersRef.current[obstacle.id] = { polygon, listener }
      } else {
        // point (기본)
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(obstacle.lat, obstacle.lng),
          map: mapRef.current,
          icon: createMarkerIcon(obstacle.dangerLevel),
        })
        // M-1: 리스너 핸들 저장, ref 패턴으로 최신 콜백 참조
        const listener = window.naver.maps.Event.addListener(marker, 'click', () =>
          onMarkerClickRef.current(obstacle.id)
        )
        markersRef.current[obstacle.id] = { marker, listener }
      }
    })
  }, [obstacles, mapReady, createMarkerIcon])

  // InfoWindow
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    if (!activeMarkerId) {
      infoWindowRef.current?.close()
      return
    }

    const obstacle = allObstacles.find((o) => o.id === activeMarkerId)
    if (!obstacle) return

    const content = `
      <div class="iw-container">
        <button class="iw-close" onclick="window.__closeInfoWindow__()">✕</button>
        <div class="iw-badges">
          <span class="iw-badge iw-cat">${escapeHtml(obstacle.category)}</span>
          <span class="iw-badge iw-danger iw-danger--${escapeHtml(obstacle.dangerLevel)}">${escapeHtml(obstacle.dangerLevel)}</span>
        </div>
        <div class="iw-title">${escapeHtml(obstacle.title)}</div>
        ${obstacle.description ? `<div class="iw-desc">${escapeHtml(obstacle.description)}</div>` : ''}
        <div class="iw-date">${new Date(obstacle.createdAt).toLocaleDateString('ko-KR')}</div>
        <div class="iw-actions">
          <button class="iw-btn iw-btn--edit" onclick="window.__editObstacle__('${obstacle.id}')">수정</button>
          <button class="iw-btn iw-btn--delete" onclick="window.__deleteObstacle__('${obstacle.id}')">삭제</button>
        </div>
      </div>
    `

    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.naver.maps.InfoWindow({
        content,
        borderWidth: 0,
        backgroundColor: 'transparent',
        anchorSize: new window.naver.maps.Size(10, 10),
      })
    } else {
      infoWindowRef.current.setContent(content)
    }

    const entry = markersRef.current[activeMarkerId]
    if (entry) {
      // anchor 위치: marker는 marker 객체, polyline/polygon은 첫 좌표 LatLng 사용
      if (entry.marker) {
        infoWindowRef.current.open(mapRef.current, entry.marker)
      } else {
        const anchorLat = obstacle.lat ?? obstacle.coordinates?.[0]?.lat
        const anchorLng = obstacle.lng ?? obstacle.coordinates?.[0]?.lng
        const anchorLatLng = new window.naver.maps.LatLng(anchorLat, anchorLng)
        infoWindowRef.current.open(mapRef.current, anchorLatLng)
      }
    }
  }, [activeMarkerId, mapReady, allObstacles])

  // 위시리스트 마커 동기화
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    // 현재 wishlistItems에 없는 마커 제거
    Object.entries(wishlistMarkersRef.current).forEach(([id, entry]) => {
      const exists = wishlistItems.some((item) => item.id === id)
      if (!exists) {
        window.naver.maps.Event.removeListener(entry.listener)
        entry.marker.setMap(null)
        delete wishlistMarkersRef.current[id]
      }
    })

    wishlistItems.forEach((item) => {
      if (wishlistMarkersRef.current[item.id]) {
        // 아이콘 업데이트 (visitCount 변경 반영)
        wishlistMarkersRef.current[item.id].marker.setIcon(
          createWishlistMarkerIcon(item.visitCount)
        )
        return
      }

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(item.lat, item.lng),
        map: mapRef.current,
        icon: createWishlistMarkerIcon(item.visitCount),
      })
      const listener = window.naver.maps.Event.addListener(marker, 'click', () =>
        onWishlistItemClickRef.current?.(item.id)
      )
      wishlistMarkersRef.current[item.id] = { marker, listener }
    })
  }, [wishlistItems, mapReady, createWishlistMarkerIcon])

  return (
    <div className={styles.mapWrapper}>
      <div ref={mapContainerRef} className={styles.map} />
      {!mapReady && (
        <div className={styles.placeholder}>
          <div className={styles.placeholderText}>
            {import.meta.env.VITE_NAVER_CLIENT_ID &&
            import.meta.env.VITE_NAVER_CLIENT_ID !== 'your_client_id_here'
              ? '지도를 불러오는 중...'
              : '네이버 지도 API 키를 설정해 주세요.'}
          </div>
          {(!import.meta.env.VITE_NAVER_CLIENT_ID ||
            import.meta.env.VITE_NAVER_CLIENT_ID === 'your_client_id_here') && (
            <div className={styles.placeholderHint}>
              .env 파일에 <code>VITE_NAVER_CLIENT_ID</code>를 설정하세요.
            </div>
          )}
        </div>
      )}
      <DrawToolbar drawMode={drawMode} onModeChange={onDrawModeChange} />
      <DrawStatusBar
        drawMode={drawMode}
        coordCount={coords?.length ?? 0}
        onComplete={onDrawComplete}
        onUndo={onDrawUndo}
        onCancel={onDrawCancel}
      />
    </div>
  )
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
