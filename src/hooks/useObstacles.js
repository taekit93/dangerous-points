import { useState } from 'react'
import * as storage from '../utils/storage'

export function useObstacles() {
  const [obstacles, setObstacles] = useState(() => storage.getAll())

  function addObstacle(data) {
    const newItem = storage.create(data)
    setObstacles((prev) => [...prev, newItem])
    return newItem
  }

  function updateObstacle(id, data) {
    const updated = storage.update(id, data)
    setObstacles((prev) => prev.map((o) => (o.id === id ? updated : o)))
    return updated
  }

  function removeObstacle(id) {
    storage.remove(id)
    setObstacles((prev) => prev.filter((o) => o.id !== id))
  }

  return { obstacles, addObstacle, updateObstacle, removeObstacle }
}
