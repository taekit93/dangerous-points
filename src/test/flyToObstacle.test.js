import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flyToObstacle } from '../utils/flyToObstacle'

// naver.maps mock
const mockPanTo = vi.fn()
const mockFitBounds = vi.fn()
const mockExtend = vi.fn()

function makeMockMap() {
  return { panTo: mockPanTo, fitBounds: mockFitBounds }
}

beforeEach(() => {
  mockPanTo.mockClear()
  mockFitBounds.mockClear()
  mockExtend.mockClear()

  window.naver = {
    maps: {
      LatLng: vi.fn(function (lat, lng) { return { lat, lng, _type: 'LatLng' } }),
      LatLngBounds: vi.fn(function () { return { extend: mockExtend } }),
    },
  }
})

describe('flyToObstacle', () => {
  it('point 장애물이면 panTo를 호출한다', () => {
    const map = makeMockMap()
    const obstacle = { id: '1', type: 'point', lat: 37.5, lng: 126.9 }

    flyToObstacle(map, obstacle)

    expect(mockPanTo).toHaveBeenCalledTimes(1)
    expect(mockFitBounds).not.toHaveBeenCalled()
  })

  it('type이 없으면(기본 point) panTo를 호출한다', () => {
    const map = makeMockMap()
    const obstacle = { id: '1', lat: 37.5, lng: 126.9 }

    flyToObstacle(map, obstacle)

    expect(mockPanTo).toHaveBeenCalledTimes(1)
    expect(mockFitBounds).not.toHaveBeenCalled()
  })

  it('line 장애물이면 fitBounds를 호출한다', () => {
    const map = makeMockMap()
    const obstacle = {
      id: '2',
      type: 'line',
      coordinates: [
        { lat: 37.5, lng: 126.9 },
        { lat: 37.6, lng: 127.0 },
      ],
    }

    flyToObstacle(map, obstacle)

    expect(mockFitBounds).toHaveBeenCalledTimes(1)
    expect(mockPanTo).not.toHaveBeenCalled()
  })

  it('line 장애물이면 모든 coordinates로 bounds를 확장한다', () => {
    const map = makeMockMap()
    const obstacle = {
      id: '2',
      type: 'line',
      coordinates: [
        { lat: 37.5, lng: 126.9 },
        { lat: 37.6, lng: 127.0 },
        { lat: 37.7, lng: 127.1 },
      ],
    }

    flyToObstacle(map, obstacle)

    expect(mockExtend).toHaveBeenCalledTimes(3)
  })

  it('polygon 장애물이면 fitBounds를 호출한다', () => {
    const map = makeMockMap()
    const obstacle = {
      id: '3',
      type: 'polygon',
      coordinates: [
        { lat: 37.5, lng: 126.9 },
        { lat: 37.6, lng: 127.0 },
        { lat: 37.7, lng: 126.9 },
      ],
    }

    flyToObstacle(map, obstacle)

    expect(mockFitBounds).toHaveBeenCalledTimes(1)
    expect(mockPanTo).not.toHaveBeenCalled()
  })

  it('polygon 장애물이면 모든 coordinates로 bounds를 확장한다', () => {
    const map = makeMockMap()
    const obstacle = {
      id: '3',
      type: 'polygon',
      coordinates: [
        { lat: 37.5, lng: 126.9 },
        { lat: 37.6, lng: 127.0 },
        { lat: 37.7, lng: 126.9 },
      ],
    }

    flyToObstacle(map, obstacle)

    expect(mockExtend).toHaveBeenCalledTimes(3)
  })

  it('map이 null이면 아무것도 하지 않는다', () => {
    const obstacle = { id: '1', lat: 37.5, lng: 126.9 }

    expect(() => flyToObstacle(null, obstacle)).not.toThrow()
    expect(mockPanTo).not.toHaveBeenCalled()
  })

  it('obstacle이 null이면 아무것도 하지 않는다', () => {
    const map = makeMockMap()

    expect(() => flyToObstacle(map, null)).not.toThrow()
    expect(mockPanTo).not.toHaveBeenCalled()
  })
})
