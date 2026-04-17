const SUPPORTED_TYPES = ['Point', 'LineString', 'Polygon']

/**
 * GeoJSON 텍스트를 파싱한다.
 * @param {string} text
 * @returns {object} 파싱된 GeoJSON 객체
 * @throws {Error} 유효하지 않은 JSON 또는 GeoJSON 형식인 경우
 */
export function parseGeoJson(text) {
  if (!text || !text.trim()) {
    throw new Error('GeoJSON 텍스트를 입력해 주세요.')
  }

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    throw new Error(`JSON 파싱 오류: ${e.message}`)
  }

  if (parsed.type !== 'Feature' && parsed.type !== 'FeatureCollection') {
    throw new Error(
      `지원하지 않는 GeoJSON 형식입니다. Feature 또는 FeatureCollection만 허용됩니다. (받은 타입: ${parsed.type})`
    )
  }

  return parsed
}

/**
 * GeoJSON의 coordinates 배열을 내부 {lat, lng} 배열로 변환한다.
 * @param {number[][]} coordinates GeoJSON 좌표 배열 [[lng, lat], ...]
 * @returns {{ lat: number, lng: number }[]}
 */
function coordsToLatLng(coordinates) {
  return coordinates.map(([lng, lat]) => ({ lat, lng }))
}

/**
 * properties에서 title 값을 추출한다. (name/title/제목 키 지원)
 */
function extractTitle(properties) {
  if (!properties) return null
  return properties.title || properties.name || properties['제목'] || null
}

/**
 * properties에서 dangerLevel 값을 추출한다. (dangerLevel/danger_level/danger/위험도 키 지원)
 */
function extractDangerLevel(properties) {
  if (!properties) return null
  return properties.dangerLevel || properties.danger_level || properties.danger || properties['위험도'] || null
}

/**
 * 단일 Feature를 내부 장애물 포맷으로 변환한다.
 * @returns {object|null} 변환된 장애물 객체. 미지원 geometry면 null.
 */
function featureToObstacle(feature, metadata) {
  const { geometry, properties } = feature
  if (!geometry) return null

  const { type, coordinates } = geometry
  if (!SUPPORTED_TYPES.includes(type)) return null

  const propTitle = extractTitle(properties)
  const propCategory = properties?.category || properties?.['카테고리'] || null
  const propDangerLevel = extractDangerLevel(properties)
  const propDescription = properties?.description || properties?.['설명'] || null

  const resolvedTitle = metadata.title || propTitle || ''
  const resolvedCategory = metadata.category || propCategory || '기타'
  const resolvedDangerLevel = metadata.dangerLevel || propDangerLevel || ''
  const resolvedDescription = metadata.description || propDescription || ''

  if (type === 'Point') {
    const [lng, lat] = coordinates
    return {
      type: 'point',
      lat,
      lng,
      coordinates: null,
      title: resolvedTitle,
      category: resolvedCategory,
      dangerLevel: resolvedDangerLevel,
      description: resolvedDescription,
    }
  }

  if (type === 'LineString') {
    const latLngs = coordsToLatLng(coordinates)
    return {
      type: 'line',
      lat: latLngs[0]?.lat ?? 0,
      lng: latLngs[0]?.lng ?? 0,
      coordinates: latLngs,
      title: resolvedTitle,
      category: resolvedCategory,
      dangerLevel: resolvedDangerLevel,
      description: resolvedDescription,
    }
  }

  // Polygon: 외곽 링(index 0)만 사용
  if (type === 'Polygon') {
    const outerRing = coordinates[0]
    const latLngs = coordsToLatLng(outerRing)
    return {
      type: 'polygon',
      lat: latLngs[0]?.lat ?? 0,
      lng: latLngs[0]?.lng ?? 0,
      coordinates: latLngs,
      title: resolvedTitle,
      category: resolvedCategory,
      dangerLevel: resolvedDangerLevel,
      description: resolvedDescription,
    }
  }

  return null
}

/**
 * GeoJSON Feature 배열을 내부 장애물 포맷 배열로 변환한다.
 * @param {object} geoJson parseGeoJson()이 반환한 GeoJSON 객체
 * @param {{ title: string, category: string, dangerLevel: string, description: string }} metadata
 * @returns {{ obstacles: object[], skipped: number }}
 */
export function geoJsonToObstacles(geoJson, metadata) {
  const features =
    geoJson.type === 'FeatureCollection'
      ? geoJson.features ?? []
      : [geoJson]

  const obstacles = []
  let skipped = 0

  features.forEach((feature) => {
    const obstacle = featureToObstacle(feature, metadata)
    if (obstacle) {
      obstacles.push(obstacle)
    } else {
      skipped++
    }
  })

  // 여러 Feature이고 title이 비어 있으면 자동 생성
  if (obstacles.length > 1 && !metadata.title) {
    obstacles.forEach((obs, i) => {
      if (!obs.title) {
        obs.title = `가져온 장애물 ${i + 1}`
      }
    })
  }

  return { obstacles, skipped }
}
