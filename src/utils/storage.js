import { generateUUID } from './uuid'

const STORAGE_KEY = 'obstacles'

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
    console.error('[storage] localStorage 저장 실패:', e)
    return false
  }
}

export function getAll() {
  return load()
}

export function create(data) {
  const items = load()
  const now = new Date().toISOString()
  const newItem = {
    ...data,
    id: generateUUID(),
    createdAt: now,
    updatedAt: now,
  }
  save([...items, newItem])
  return newItem
}

export function update(id, data) {
  const items = load()
  const updated = items.map((item) =>
    item.id === id ? { ...item, ...data, id, updatedAt: new Date().toISOString() } : item
  )
  save(updated)
  return updated.find((item) => item.id === id)
}

export function remove(id) {
  const items = load()
  save(items.filter((item) => item.id !== id))
}
