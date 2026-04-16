import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAll, create, update, remove } from '../utils/storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('getAll', () => {
    it('localStorage가 비어 있으면 빈 배열을 반환한다', () => {
      expect(getAll()).toEqual([])
    })

    it('저장된 항목들을 반환한다', () => {
      const items = [{ id: '1', title: 'test' }]
      localStorage.setItem('obstacles', JSON.stringify(items))
      expect(getAll()).toEqual(items)
    })

    it('localStorage 값이 유효하지 않은 JSON이면 빈 배열을 반환한다', () => {
      localStorage.setItem('obstacles', 'invalid-json')
      expect(getAll()).toEqual([])
    })
  })

  describe('create', () => {
    it('id, createdAt, updatedAt을 자동으로 추가한다', () => {
      const item = create({ title: 'test', lat: 37.5, lng: 126.9, category: '기타', dangerLevel: '주의', description: '' })
      expect(item.id).toBeDefined()
      expect(item.createdAt).toBeDefined()
      expect(item.updatedAt).toBeDefined()
      expect(item.title).toBe('test')
    })

    it('생성된 항목이 localStorage에 저장된다', () => {
      create({ title: 'a', lat: 1, lng: 2, category: '기타', dangerLevel: '안전', description: '' })
      expect(getAll()).toHaveLength(1)
    })

    it('여러 항목을 생성하면 모두 저장된다', () => {
      create({ title: 'a', lat: 1, lng: 2, category: '기타', dangerLevel: '안전', description: '' })
      create({ title: 'b', lat: 3, lng: 4, category: '공사중', dangerLevel: '위험', description: '' })
      expect(getAll()).toHaveLength(2)
    })
  })

  describe('update', () => {
    it('지정한 id의 항목을 수정하고 updatedAt을 갱신한다', () => {
      const created = create({ title: 'old', lat: 1, lng: 2, category: '기타', dangerLevel: '안전', description: '' })
      const oldUpdatedAt = created.updatedAt

      vi.advanceTimersByTime && vi.useFakeTimers()
      const updated = update(created.id, { title: 'new' })
      expect(updated.title).toBe('new')
      expect(updated.id).toBe(created.id)
    })

    it('수정 후 목록에서 해당 항목이 변경된다', () => {
      const created = create({ title: 'old', lat: 1, lng: 2, category: '기타', dangerLevel: '안전', description: '' })
      update(created.id, { title: 'updated' })
      const all = getAll()
      expect(all[0].title).toBe('updated')
    })
  })

  describe('remove', () => {
    it('지정한 id의 항목을 삭제한다', () => {
      const item = create({ title: 'to-delete', lat: 1, lng: 2, category: '기타', dangerLevel: '안전', description: '' })
      remove(item.id)
      expect(getAll()).toHaveLength(0)
    })

    it('다른 항목에는 영향을 주지 않는다', () => {
      const keep = create({ title: 'keep', lat: 1, lng: 2, category: '기타', dangerLevel: '안전', description: '' })
      const del = create({ title: 'delete', lat: 3, lng: 4, category: '기타', dangerLevel: '안전', description: '' })
      remove(del.id)
      const all = getAll()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe(keep.id)
    })
  })
})
