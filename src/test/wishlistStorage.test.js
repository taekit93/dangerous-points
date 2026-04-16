import { describe, it, expect, beforeEach } from 'vitest'
import {
  getWishlist,
  addWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  incrementVisit,
  addReview,
} from '../utils/wishlistStorage'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('wishlistStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getWishlist', () => {
    it('localStorage가 비어 있으면 빈 배열을 반환한다', () => {
      expect(getWishlist()).toEqual([])
    })

    it('저장된 항목들을 반환한다', () => {
      const items = [{ id: '1', name: '테스트 카페' }]
      localStorage.setItem('wishlist', JSON.stringify(items))
      expect(getWishlist()).toEqual(items)
    })

    it('localStorage 값이 유효하지 않은 JSON이면 빈 배열을 반환한다', () => {
      localStorage.setItem('wishlist', 'invalid-json')
      expect(getWishlist()).toEqual([])
    })
  })

  describe('addWishlistItem', () => {
    it('id, createdAt, updatedAt, visitCount, reviews를 자동으로 추가한다', () => {
      const item = addWishlistItem({ name: '카페', category: '카페', lat: 37.5, lng: 126.9 })
      expect(item.id).toMatch(UUID_REGEX)
      expect(item.createdAt).toBeDefined()
      expect(item.updatedAt).toBeDefined()
      expect(item.visitCount).toBe(0)
      expect(item.reviews).toEqual([])
    })

    it('생성된 항목이 localStorage에 저장된다', () => {
      addWishlistItem({ name: '카페A', category: '카페', lat: 37.5, lng: 126.9 })
      expect(getWishlist()).toHaveLength(1)
    })

    it('여러 항목을 생성하면 모두 저장된다', () => {
      addWishlistItem({ name: '카페A', category: '카페', lat: 37.5, lng: 126.9 })
      addWishlistItem({ name: '맛집B', category: '맛집', lat: 37.6, lng: 127.0 })
      expect(getWishlist()).toHaveLength(2)
    })
  })

  describe('updateWishlistItem', () => {
    it('지정한 id의 항목을 수정하고 updatedAt을 갱신한다', () => {
      const created = addWishlistItem({ name: '원래이름', category: '카페', lat: 37.5, lng: 126.9 })
      const updated = updateWishlistItem(created.id, { name: '바뀐이름' })
      expect(updated.name).toBe('바뀐이름')
      expect(updated.id).toBe(created.id)
    })

    it('수정 후 목록에서 해당 항목이 변경된다', () => {
      const created = addWishlistItem({ name: '원래이름', category: '카페', lat: 37.5, lng: 126.9 })
      updateWishlistItem(created.id, { name: '수정됨' })
      expect(getWishlist()[0].name).toBe('수정됨')
    })
  })

  describe('deleteWishlistItem', () => {
    it('지정한 id의 항목을 삭제한다', () => {
      const item = addWishlistItem({ name: '삭제대상', category: '기타', lat: 37.5, lng: 126.9 })
      deleteWishlistItem(item.id)
      expect(getWishlist()).toHaveLength(0)
    })

    it('다른 항목에는 영향을 주지 않는다', () => {
      const keep = addWishlistItem({ name: '유지', category: '카페', lat: 37.5, lng: 126.9 })
      const del = addWishlistItem({ name: '삭제', category: '기타', lat: 37.6, lng: 127.0 })
      deleteWishlistItem(del.id)
      const all = getWishlist()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe(keep.id)
    })
  })

  describe('incrementVisit', () => {
    it('visitCount를 1 증가시킨다', () => {
      const item = addWishlistItem({ name: '방문장소', category: '맛집', lat: 37.5, lng: 126.9 })
      expect(item.visitCount).toBe(0)
      const updated = incrementVisit(item.id)
      expect(updated.visitCount).toBe(1)
    })

    it('여러 번 호출하면 누적으로 증가한다', () => {
      const item = addWishlistItem({ name: '자주가는곳', category: '카페', lat: 37.5, lng: 126.9 })
      incrementVisit(item.id)
      const updated = incrementVisit(item.id)
      expect(updated.visitCount).toBe(2)
    })

    it('updatedAt이 갱신된다', () => {
      const item = addWishlistItem({ name: '테스트', category: '기타', lat: 37.5, lng: 126.9 })
      const originalUpdatedAt = item.updatedAt
      const updated = incrementVisit(item.id)
      expect(updated.updatedAt).toBeDefined()
    })
  })

  describe('addReview', () => {
    it('리뷰를 reviews 배열에 추가한다', () => {
      const item = addWishlistItem({ name: '리뷰장소', category: '맛집', lat: 37.5, lng: 126.9 })
      incrementVisit(item.id)
      const updated = addReview(item.id, { text: '맛있었어요', visitNum: 1 })
      expect(updated.reviews).toHaveLength(1)
      expect(updated.reviews[0].text).toBe('맛있었어요')
      expect(updated.reviews[0].visitNum).toBe(1)
    })

    it('리뷰에 id와 createdAt이 자동 추가된다', () => {
      const item = addWishlistItem({ name: '리뷰장소', category: '카페', lat: 37.5, lng: 126.9 })
      incrementVisit(item.id)
      const updated = addReview(item.id, { text: '좋았어요' })
      expect(updated.reviews[0].id).toMatch(UUID_REGEX)
      expect(updated.reviews[0].createdAt).toBeDefined()
    })

    it('여러 후기를 누적으로 추가한다', () => {
      const item = addWishlistItem({ name: '리뷰장소', category: '공원', lat: 37.5, lng: 126.9 })
      incrementVisit(item.id)
      incrementVisit(item.id)
      addReview(item.id, { text: '첫번째 후기', visitNum: 1 })
      const updated = addReview(item.id, { text: '두번째 후기', visitNum: 2 })
      expect(updated.reviews).toHaveLength(2)
    })
  })
})
