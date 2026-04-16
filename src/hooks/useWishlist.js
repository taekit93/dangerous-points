import { useState } from 'react'
import * as wishlistStorage from '../utils/wishlistStorage'

export function useWishlist() {
  const [items, setItems] = useState(() => wishlistStorage.getWishlist())
  const [selectedItem, setSelectedItem] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formPosition, setFormPosition] = useState(null)

  function handleMapClick({ lat, lng }) {
    setFormPosition({ lat, lng })
    setIsFormOpen(true)
    setSelectedItem(null)
  }

  function saveItem(data) {
    const newItem = wishlistStorage.addWishlistItem(data)
    setItems((prev) => [...prev, newItem])
    setIsFormOpen(false)
    setFormPosition(null)
  }

  function deleteItem(id) {
    wishlistStorage.deleteWishlistItem(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }
  }

  function selectItem(id) {
    const item = items.find((i) => i.id === id)
    setSelectedItem(item ?? null)
    setIsFormOpen(false)
  }

  function closeForm() {
    setIsFormOpen(false)
    setFormPosition(null)
  }

  function closeDetail() {
    setSelectedItem(null)
  }

  function incrementVisit(id) {
    const updated = wishlistStorage.incrementVisit(id)
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
    setSelectedItem(updated)
  }

  function addReview(itemId, review) {
    const updated = wishlistStorage.addReview(itemId, review)
    setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)))
    setSelectedItem(updated)
  }

  return {
    items,
    selectedItem,
    isFormOpen,
    formPosition,
    handleMapClick,
    saveItem,
    deleteItem,
    selectItem,
    closeForm,
    closeDetail,
    incrementVisit,
    addReview,
  }
}
