import { useCallback, useEffect, useRef, useState } from 'react'
import { DANGER_COLORS } from '../constants/categories'
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
}) {
  const mapContainerRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const infoWindowRef = useRef(null)

  // C-1: 외부 콜백을 ref로 감싸 최신 참조 유지
  const onMapClickRef = useRef(onMapClick)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onCloseInfoWindowRef = useRef(onCloseInfoWindow)
  const onEditObstacleRef = useRef(onEditObstacle)
  const onDeleteObstacleRef = useRef(onDeleteObstacle)

  useEffect(() => { onMapClickRef.current = onMapClick }, [onMapClick])
  useEffect(() => { onMarkerClickRef.current = onMarkerClick }, [onMarkerClick])
  useEffect(() => { onCloseInfoWindowRef.current = onCloseInfoWindow }, [onCloseInfoWindow])
  useEffect(() => { onEditObstacleRef.current = onEditObstacle }, [onEditObstacle])
  useEffect(() => { onDeleteObstacleRef.current = onDeleteObstacle }, [onDeleteObstacle])

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

  // C-1 + M-1: 마커 동기화 — deps 정확히 명시, 리스너 누수 수정
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    Object.entries(markersRef.current).forEach(([id, entry]) => {
      const isVisible = obstacles.some((o) => o.id === id)
      entry.marker.setVisible(isVisible)
    })

    obstacles.forEach((obstacle) => {
      if (!markersRef.current[obstacle.id]) {
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
      } else {
        markersRef.current[obstacle.id].marker.setIcon(createMarkerIcon(obstacle.dangerLevel))
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
      infoWindowRef.current.open(mapRef.current, entry.marker)
    }
  }, [activeMarkerId, mapReady, allObstacles])

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
