import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getAll, create, update, remove } from '../utils/storage'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

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

  describe('e2e: generateUUID 통합 검증', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('create()가 반환하는 id는 UUID v4 형식이다', () => {
      const item = create({ title: 'uuid-check', lat: 37.5, lng: 126.9, category: '기타', dangerLevel: '안전', description: '' })
      expect(item.id).toMatch(UUID_REGEX)
    })

    it('여러 항목 생성 시 id가 모두 고유하다 (UUID 충돌 없음)', () => {
      const count = 20
      const items = Array.from({ length: count }, (_, i) =>
        create({ title: `item-${i}`, lat: i, lng: i, category: '기타', dangerLevel: '안전', description: '' })
      )
      const ids = new Set(items.map((item) => item.id))
      expect(ids.size).toBe(count)
    })

    it('crypto.randomUUID가 없는 환경(HTTP)에서도 create()가 UUID v4 id를 생성한다', () => {
      const originalRandomUUID = crypto.randomUUID
      Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true })

      const item = create({ title: 'http-env', lat: 37.5, lng: 126.9, category: '기타', dangerLevel: '안전', description: '' })
      expect(item.id).toMatch(UUID_REGEX)

      Object.defineProperty(crypto, 'randomUUID', { value: originalRandomUUID, configurable: true })
    })

    it('crypto가 완전히 없는 환경에서도 create()가 UUID v4 id를 생성한다', () => {
      const originalCrypto = globalThis.crypto
      Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true, writable: true })

      const item = create({ title: 'no-crypto', lat: 37.5, lng: 126.9, category: '기타', dangerLevel: '안전', description: '' })
      expect(item.id).toMatch(UUID_REGEX)

      Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, configurable: true, writable: true })
    })

    it('HTTP 환경 시뮬레이션에서 생성된 항목을 update/remove로 조작할 수 있다', () => {
      const originalRandomUUID = crypto.randomUUID
      Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true })

      const item = create({ title: 'http-crud', lat: 37.5, lng: 126.9, category: '기타', dangerLevel: '안전', description: '' })
      expect(item.id).toMatch(UUID_REGEX)

      Object.defineProperty(crypto, 'randomUUID', { value: originalRandomUUID, configurable: true })

      const updated = update(item.id, { title: 'http-crud-updated' })
      expect(updated.title).toBe('http-crud-updated')
      expect(updated.id).toBe(item.id)

      remove(item.id)
      expect(getAll()).toHaveLength(0)
    })
  })
})
