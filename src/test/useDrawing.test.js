import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDrawing } from '../hooks/useDrawing'

describe('useDrawing', () => {
  it('초기 drawMode는 point이다', () => {
    const { result } = renderHook(() => useDrawing())
    expect(result.current.drawMode).toBe('point')
  })

  it('초기 coords는 빈 배열이다', () => {
    const { result } = renderHook(() => useDrawing())
    expect(result.current.coords).toEqual([])
  })

  it('setDrawMode로 모드를 변경할 수 있다', () => {
    const { result } = renderHook(() => useDrawing())
    act(() => {
      result.current.setDrawMode('line')
    })
    expect(result.current.drawMode).toBe('line')
  })

  it('setDrawMode 호출 시 coords가 초기화된다', () => {
    const { result } = renderHook(() => useDrawing())
    act(() => {
      result.current.addCoord({ lat: 37.5, lng: 126.9 })
    })
    act(() => {
      result.current.setDrawMode('polygon')
    })
    expect(result.current.coords).toEqual([])
  })

  it('addCoord로 좌표를 추가할 수 있다', () => {
    const { result } = renderHook(() => useDrawing())
    act(() => {
      result.current.addCoord({ lat: 37.5, lng: 126.9 })
    })
    expect(result.current.coords).toHaveLength(1)
    expect(result.current.coords[0]).toEqual({ lat: 37.5, lng: 126.9 })
  })

  it('addCoord 여러 번 호출 시 누적된다', () => {
    const { result } = renderHook(() => useDrawing())
    act(() => {
      result.current.addCoord({ lat: 37.5, lng: 126.9 })
      result.current.addCoord({ lat: 37.6, lng: 127.0 })
    })
    expect(result.current.coords).toHaveLength(2)
  })

  it('undoCoord로 마지막 좌표가 제거된다', () => {
    const { result } = renderHook(() => useDrawing())
    act(() => {
      result.current.addCoord({ lat: 37.5, lng: 126.9 })
      result.current.addCoord({ lat: 37.6, lng: 127.0 })
    })
    act(() => {
      result.current.undoCoord()
    })
    expect(result.current.coords).toHaveLength(1)
    expect(result.current.coords[0]).toEqual({ lat: 37.5, lng: 126.9 })
  })

  it('coords가 빈 상태에서 undoCoord를 호출해도 에러가 없다', () => {
    const { result } = renderHook(() => useDrawing())
    expect(() => {
      act(() => {
        result.current.undoCoord()
      })
    }).not.toThrow()
    expect(result.current.coords).toEqual([])
  })

  it('resetDrawing으로 coords가 초기화된다', () => {
    const { result } = renderHook(() => useDrawing())
    act(() => {
      result.current.addCoord({ lat: 37.5, lng: 126.9 })
      result.current.addCoord({ lat: 37.6, lng: 127.0 })
    })
    act(() => {
      result.current.resetDrawing()
    })
    expect(result.current.coords).toEqual([])
  })

  it('resetDrawing은 drawMode를 변경하지 않는다', () => {
    const { result } = renderHook(() => useDrawing())
    act(() => {
      result.current.setDrawMode('polygon')
    })
    act(() => {
      result.current.resetDrawing()
    })
    expect(result.current.drawMode).toBe('polygon')
  })
})
