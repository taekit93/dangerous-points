import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useObstacles } from '../hooks/useObstacles'

describe('useObstacles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('초기 상태는 빈 배열이다', () => {
    const { result } = renderHook(() => useObstacles())
    expect(result.current.obstacles).toEqual([])
  })

  it('addObstacle이 obstacles에 항목을 추가한다', () => {
    const { result } = renderHook(() => useObstacles())
    act(() => {
      result.current.addObstacle({ title: 'test', lat: 37.5, lng: 126.9, category: '기타', dangerLevel: '주의', description: '' })
    })
    expect(result.current.obstacles).toHaveLength(1)
    expect(result.current.obstacles[0].title).toBe('test')
  })

  it('updateObstacle이 해당 항목을 수정한다', () => {
    const { result } = renderHook(() => useObstacles())
    let id
    act(() => {
      const item = result.current.addObstacle({ title: 'old', lat: 37.5, lng: 126.9, category: '기타', dangerLevel: '주의', description: '' })
      id = item.id
    })
    act(() => {
      result.current.updateObstacle(id, { title: 'new' })
    })
    expect(result.current.obstacles[0].title).toBe('new')
  })

  it('removeObstacle이 해당 항목을 제거한다', () => {
    const { result } = renderHook(() => useObstacles())
    let id
    act(() => {
      const item = result.current.addObstacle({ title: 'delete', lat: 37.5, lng: 126.9, category: '기타', dangerLevel: '주의', description: '' })
      id = item.id
    })
    act(() => {
      result.current.removeObstacle(id)
    })
    expect(result.current.obstacles).toHaveLength(0)
  })

  it('addObstacles가 여러 항목을 한 번에 추가한다', () => {
    const { result } = renderHook(() => useObstacles())
    act(() => {
      result.current.addObstacles([
        { title: 'first', lat: 37.5, lng: 126.9, type: 'point', coordinates: null, category: '기타', dangerLevel: '주의', description: '' },
        { title: 'second', lat: 37.6, lng: 127.0, type: 'point', coordinates: null, category: '공사중', dangerLevel: '위험', description: '' },
      ])
    })
    expect(result.current.obstacles).toHaveLength(2)
    expect(result.current.obstacles[0].title).toBe('first')
    expect(result.current.obstacles[1].title).toBe('second')
  })

  it('addObstacles가 localStorage에 모든 항목을 저장한다', () => {
    const { result } = renderHook(() => useObstacles())
    act(() => {
      result.current.addObstacles([
        { title: 'a', lat: 37.5, lng: 126.9, type: 'point', coordinates: null, category: '기타', dangerLevel: '주의', description: '' },
        { title: 'b', lat: 37.6, lng: 127.0, type: 'point', coordinates: null, category: '기타', dangerLevel: '안전', description: '' },
      ])
    })
    const stored = JSON.parse(localStorage.getItem('obstacles'))
    expect(stored).toHaveLength(2)
  })

  it('addObstacles가 추가된 항목 배열을 반환한다', () => {
    const { result } = renderHook(() => useObstacles())
    let returned
    act(() => {
      returned = result.current.addObstacles([
        { title: 'x', lat: 37.5, lng: 126.9, type: 'point', coordinates: null, category: '기타', dangerLevel: '위험', description: '' },
      ])
    })
    expect(returned).toHaveLength(1)
    expect(returned[0].id).toBeDefined()
    expect(returned[0].title).toBe('x')
  })

  it('localStorage에 저장된 데이터로 초기화된다', () => {
    localStorage.setItem('obstacles', JSON.stringify([
      { id: 'abc', title: 'existing', lat: 1, lng: 2, category: '기타', dangerLevel: '안전', description: '', createdAt: '', updatedAt: '' }
    ]))
    const { result } = renderHook(() => useObstacles())
    expect(result.current.obstacles).toHaveLength(1)
    expect(result.current.obstacles[0].id).toBe('abc')
  })
})
