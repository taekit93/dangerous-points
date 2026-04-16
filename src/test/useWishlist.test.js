import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWishlist } from '../hooks/useWishlist'

const SAMPLE_ITEM = { name: '테스트 카페', category: '카페', lat: 37.5, lng: 126.9, address: '' }

describe('useWishlist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('초기 상태: items는 빈 배열, isFormOpen은 false', () => {
    const { result } = renderHook(() => useWishlist())
    expect(result.current.items).toEqual([])
    expect(result.current.isFormOpen).toBe(false)
    expect(result.current.selectedItem).toBeNull()
    expect(result.current.formPosition).toBeNull()
  })

  it('handleMapClick이 isFormOpen을 true로, formPosition을 좌표로 설정한다', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => {
      result.current.handleMapClick({ lat: 37.5, lng: 126.9 })
    })
    expect(result.current.isFormOpen).toBe(true)
    expect(result.current.formPosition).toEqual({ lat: 37.5, lng: 126.9 })
  })

  it('saveItem이 items에 항목을 추가하고 폼을 닫는다', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => {
      result.current.handleMapClick({ lat: 37.5, lng: 126.9 })
    })
    act(() => {
      result.current.saveItem(SAMPLE_ITEM)
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('테스트 카페')
    expect(result.current.isFormOpen).toBe(false)
    expect(result.current.formPosition).toBeNull()
  })

  it('deleteItem이 해당 항목을 제거한다', () => {
    const { result } = renderHook(() => useWishlist())
    let id
    act(() => {
      result.current.saveItem(SAMPLE_ITEM)
      id = result.current.items[0]?.id
    })
    // saveItem 직접 호출 후 id 확인
    act(() => {
      const item = result.current.items[0]
      if (item) result.current.deleteItem(item.id)
    })
    expect(result.current.items).toHaveLength(0)
  })

  it('selectItem이 selectedItem을 설정한다', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => {
      result.current.saveItem(SAMPLE_ITEM)
    })
    act(() => {
      const item = result.current.items[0]
      result.current.selectItem(item.id)
    })
    expect(result.current.selectedItem).not.toBeNull()
    expect(result.current.selectedItem.name).toBe('테스트 카페')
  })

  it('closeForm이 isFormOpen을 false로 설정한다', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => {
      result.current.handleMapClick({ lat: 37.5, lng: 126.9 })
    })
    expect(result.current.isFormOpen).toBe(true)
    act(() => {
      result.current.closeForm()
    })
    expect(result.current.isFormOpen).toBe(false)
    expect(result.current.formPosition).toBeNull()
  })

  it('closeDetail이 selectedItem을 null로 설정한다', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => {
      result.current.saveItem(SAMPLE_ITEM)
    })
    act(() => {
      result.current.selectItem(result.current.items[0].id)
    })
    expect(result.current.selectedItem).not.toBeNull()
    act(() => {
      result.current.closeDetail()
    })
    expect(result.current.selectedItem).toBeNull()
  })

  it('incrementVisit이 visitCount를 1 증가시키고 selectedItem을 업데이트한다', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => {
      result.current.saveItem(SAMPLE_ITEM)
    })
    act(() => {
      result.current.selectItem(result.current.items[0].id)
    })
    act(() => {
      result.current.incrementVisit(result.current.items[0].id)
    })
    expect(result.current.items[0].visitCount).toBe(1)
    expect(result.current.selectedItem.visitCount).toBe(1)
  })

  it('addReview가 reviews 배열에 후기를 추가하고 selectedItem을 업데이트한다', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => {
      result.current.saveItem(SAMPLE_ITEM)
    })
    act(() => {
      result.current.incrementVisit(result.current.items[0].id)
      result.current.selectItem(result.current.items[0].id)
    })
    act(() => {
      result.current.addReview(result.current.items[0].id, { text: '좋았어요', visitNum: 1 })
    })
    expect(result.current.selectedItem.reviews).toHaveLength(1)
    expect(result.current.selectedItem.reviews[0].text).toBe('좋았어요')
  })

  it('localStorage에 저장된 데이터로 초기화된다', () => {
    localStorage.setItem(
      'wishlist',
      JSON.stringify([
        {
          id: 'abc',
          name: '기존장소',
          category: '카페',
          lat: 37.5,
          lng: 126.9,
          visitCount: 0,
          reviews: [],
          createdAt: '',
          updatedAt: '',
        },
      ])
    )
    const { result } = renderHook(() => useWishlist())
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('abc')
  })

  it('deleteItem이 selectedItem이 삭제된 항목일 때 selectedItem을 null로 설정한다', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => {
      result.current.saveItem(SAMPLE_ITEM)
    })
    act(() => {
      result.current.selectItem(result.current.items[0].id)
    })
    expect(result.current.selectedItem).not.toBeNull()
    act(() => {
      result.current.deleteItem(result.current.items[0].id)
    })
    expect(result.current.selectedItem).toBeNull()
    expect(result.current.items).toHaveLength(0)
  })
})
