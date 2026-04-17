/**
 * 지도를 주어진 장애물 위치로 이동한다.
 * - point: panTo로 해당 좌표로 이동
 * - line / polygon: fitBounds로 전체 좌표를 포함하는 범위로 이동
 *
 * @param {object} map - naver.maps.Map 인스턴스
 * @param {object} obstacle - 장애물 객체 { type, lat, lng, coordinates }
 */
export function flyToObstacle(map, obstacle) {
  if (!map || !obstacle) return

  const type = obstacle.type

  if ((type === 'line' || type === 'polygon') && obstacle.coordinates?.length > 0) {
    const bounds = new window.naver.maps.LatLngBounds()
    obstacle.coordinates.forEach((c) => {
      bounds.extend(new window.naver.maps.LatLng(c.lat, c.lng))
    })
    map.fitBounds(bounds)
  } else {
    const lat = obstacle.lat ?? obstacle.coordinates?.[0]?.lat
    const lng = obstacle.lng ?? obstacle.coordinates?.[0]?.lng
    if (lat != null && lng != null) {
      map.panTo(new window.naver.maps.LatLng(lat, lng))
    }
  }
}
