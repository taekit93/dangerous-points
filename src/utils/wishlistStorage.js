import { generateUUID } from './uuid'

const STORAGE_KEY = 'wishlist'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch (e) {
    console.error('[wishlistStorage] localStorage 저장 실패:', e)
    return false
  }
}

export function getWishlist() {
  return load()
}

export function saveWishlist(items) {
  save(items)
}

export function addWishlistItem(data) {
  const items = load()
  const now = new Date().toISOString()
  const newItem = {
    ...data,
    id: generateUUID(),
    visitCount: 0,
    reviews: [],
    createdAt: now,
    updatedAt: now,
  }
  save([...items, newItem])
  return newItem
}

export function updateWishlistItem(id, updates) {
  const items = load()
  const updated = items.map((item) =>
    item.id === id ? { ...item, ...updates, id, updatedAt: new Date().toISOString() } : item
  )
  save(updated)
  return updated.find((item) => item.id === id)
}

export function deleteWishlistItem(id) {
  const items = load()
  save(items.filter((item) => item.id !== id))
}

export function incrementVisit(id) {
  const items = load()
  const updated = items.map((item) =>
    item.id === id
      ? { ...item, visitCount: item.visitCount + 1, updatedAt: new Date().toISOString() }
      : item
  )
  save(updated)
  return updated.find((item) => item.id === id)
}

export function addReview(itemId, review) {
  const items = load()
  const now = new Date().toISOString()
  const newReview = {
    ...review,
    id: generateUUID(),
    createdAt: now,
  }
  const updated = items.map((item) =>
    item.id === itemId
      ? { ...item, reviews: [...item.reviews, newReview], updatedAt: now }
      : item
  )
  save(updated)
  return updated.find((item) => item.id === itemId)
}
