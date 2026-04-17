import { describe, it, expect } from 'vitest'
import { parseGeoJson, geoJsonToObstacles } from '../utils/geojson'

describe('parseGeoJson', () => {
  it('유효한 FeatureCollection을 파싱한다', () => {
    const text = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [126.978, 37.566] }, properties: {} },
      ],
    })
    const result = parseGeoJson(text)
    expect(result.type).toBe('FeatureCollection')
  })

  it('유효한 Feature를 파싱한다', () => {
    const text = JSON.stringify({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [126.978, 37.566] },
      properties: {},
    })
    const result = parseGeoJson(text)
    expect(result.type).toBe('Feature')
  })

  it('잘못된 JSON은 에러를 던진다', () => {
    expect(() => parseGeoJson('{invalid')).toThrow()
  })

  it('Feature/FeatureCollection이 아니면 에러를 던진다', () => {
    const text = JSON.stringify({ type: 'GeometryCollection', geometries: [] })
    expect(() => parseGeoJson(text)).toThrow()
  })

  it('빈 문자열은 에러를 던진다', () => {
    expect(() => parseGeoJson('')).toThrow()
  })
})

describe('geoJsonToObstacles', () => {
  const metadata = { title: '', category: '기타', dangerLevel: '주의', description: '' }

  it('Point Feature를 point 타입 장애물로 변환한다', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [126.978, 37.566] },
          properties: { title: '테스트 포인트' },
        },
      ],
    }
    const { obstacles, skipped } = geoJsonToObstacles(geoJson, metadata)
    expect(obstacles).toHaveLength(1)
    expect(obstacles[0].type).toBe('point')
    expect(obstacles[0].lat).toBe(37.566)
    expect(obstacles[0].lng).toBe(126.978)
    expect(skipped).toBe(0)
  })

  it('LineString Feature를 line 타입 장애물로 변환한다', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [126.978, 37.566],
              [126.979, 37.567],
            ],
          },
          properties: {},
        },
      ],
    }
    const { obstacles, skipped } = geoJsonToObstacles(geoJson, metadata)
    expect(obstacles).toHaveLength(1)
    expect(obstacles[0].type).toBe('line')
    expect(obstacles[0].coordinates).toHaveLength(2)
    expect(obstacles[0].coordinates[0]).toEqual({ lat: 37.566, lng: 126.978 })
    expect(skipped).toBe(0)
  })

  it('Polygon Feature를 polygon 타입 장애물로 변환한다', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [126.98, 37.568],
                [126.981, 37.569],
                [126.982, 37.568],
                [126.98, 37.568],
              ],
            ],
          },
          properties: {},
        },
      ],
    }
    const { obstacles, skipped } = geoJsonToObstacles(geoJson, metadata)
    expect(obstacles).toHaveLength(1)
    expect(obstacles[0].type).toBe('polygon')
    expect(obstacles[0].coordinates).toHaveLength(4)
    expect(skipped).toBe(0)
  })

  it('미지원 geometry(MultiPolygon)는 스킵하고 카운트한다', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [126.978, 37.566] },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: { type: 'MultiPolygon', coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 0]]]] },
          properties: {},
        },
      ],
    }
    const { obstacles, skipped } = geoJsonToObstacles(geoJson, metadata)
    expect(obstacles).toHaveLength(1)
    expect(skipped).toBe(1)
  })

  it('properties에서 name → title 자동 매핑한다', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [126.978, 37.566] },
          properties: { name: '이름으로 매핑' },
        },
      ],
    }
    const { obstacles } = geoJsonToObstacles(geoJson, { ...metadata, title: '' })
    expect(obstacles[0].title).toBe('이름으로 매핑')
  })

  it('properties에서 danger_level → dangerLevel 자동 매핑한다 (metadata.dangerLevel이 없을 때)', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [126.978, 37.566] },
          properties: { danger_level: '위험' },
        },
      ],
    }
    const { obstacles } = geoJsonToObstacles(geoJson, { ...metadata, dangerLevel: '' })
    expect(obstacles[0].dangerLevel).toBe('위험')
  })

  it('metadata 값이 properties 자동매핑보다 우선한다 (title에 값이 있으면 유지)', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [126.978, 37.566] },
          properties: { title: 'properties 제목' },
        },
      ],
    }
    const { obstacles } = geoJsonToObstacles(geoJson, { ...metadata, title: '메타 제목' })
    expect(obstacles[0].title).toBe('메타 제목')
  })

  it('여러 Feature일 때 title이 비어 있으면 자동 생성한다', () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [126.978, 37.566] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Point', coordinates: [126.979, 37.567] }, properties: {} },
      ],
    }
    const { obstacles } = geoJsonToObstacles(geoJson, { ...metadata, title: '' })
    expect(obstacles[0].title).toBe('가져온 장애물 1')
    expect(obstacles[1].title).toBe('가져온 장애물 2')
  })

  it('properties의 한글 키(제목/위험도/카테고리/설명)를 자동 매핑한다', () => {
    const geoJson = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [126.978, 37.566] },
      properties: { 제목: '한글제목', 위험도: '위험', 카테고리: '공사중', 설명: '한글설명' },
    }
    const { obstacles } = geoJsonToObstacles(geoJson, { title: '', category: '', dangerLevel: '', description: '' })
    expect(obstacles[0].title).toBe('한글제목')
    expect(obstacles[0].dangerLevel).toBe('위험')
    expect(obstacles[0].category).toBe('공사중')
    expect(obstacles[0].description).toBe('한글설명')
  })

  it('properties의 danger 키를 dangerLevel로 자동 매핑한다', () => {
    const geoJson = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [126.978, 37.566] },
      properties: { danger: '주의' },
    }
    const { obstacles } = geoJsonToObstacles(geoJson, { title: '', category: '', dangerLevel: '', description: '' })
    expect(obstacles[0].dangerLevel).toBe('주의')
  })

  it('단일 Feature를 갖는 Feature 타입 GeoJSON도 처리한다', () => {
    const geoJson = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [126.978, 37.566] },
      properties: { title: '단일 Feature' },
    }
    const { obstacles, skipped } = geoJsonToObstacles(geoJson, metadata)
    expect(obstacles).toHaveLength(1)
    expect(skipped).toBe(0)
  })
})
