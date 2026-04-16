import { useState, useEffect } from 'react'
import styles from './WishlistForm.module.css'

const WISHLIST_CATEGORIES = ['맛집', '카페', '관광지', '공원', '쇼핑', '문화/예술', '기타']

/**
 * WishlistForm — 위시리스트 장소 등록 폼
 *
 * Props:
 *   position : { lat: number, lng: number }  — 지도 클릭 좌표
 *   onSave   : (data: WishlistItem) => void  — 저장 콜백
 *   onCancel : () => void                    — 취소 콜백
 */
export default function WishlistForm({ position, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (errors.name && name) setErrors((prev) => ({ ...prev, name: null }))
  }, [name, errors.name])

  useEffect(() => {
    if (errors.category && category) setErrors((prev) => ({ ...prev, category: null }))
  }, [category, errors.category])

  function validate() {
    const next = {}
    if (!name.trim()) next.name = '장소명을 입력해 주세요.'
    if (!category) next.category = '카테고리를 선택해 주세요.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      name: name.trim(),
      category,
      address: address.trim(),
      lat: position.lat,
      lng: position.lng,
    })
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>장소 등록</h2>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className={styles.coords}>
          <span className={styles.coordsLabel}>위치</span>
          <span className={styles.coordsValue}>
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* 장소명 */}
          <div className={styles.field}>
            <label className={styles.label}>
              장소명 <span className={styles.required}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="장소 이름을 입력하세요"
              autoFocus
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          {/* 카테고리 */}
          <div className={styles.field}>
            <label className={styles.label}>
              카테고리 <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${errors.category ? styles.inputError : ''}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">카테고리 선택</option>
              {WISHLIST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <span className={styles.errorMsg}>{errors.category}</span>}
          </div>

          {/* 주소 */}
          <div className={styles.field}>
            <label className={styles.label}>
              주소{' '}
              <span className={styles.optional}>(선택)</span>
            </label>
            <input
              className={styles.input}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="주소 입력 (선택)"
            />
          </div>

          {/* 위도/경도 읽기전용 */}
          <div className={styles.field}>
            <label className={styles.label}>위도 / 경도</label>
            <div className={styles.coordRow}>
              <input
                className={`${styles.input} ${styles.inputReadonly}`}
                type="text"
                value={position.lat.toFixed(5)}
                readOnly
                tabIndex={-1}
                aria-label="위도"
              />
              <input
                className={`${styles.input} ${styles.inputReadonly}`}
                type="text"
                value={position.lng.toFixed(5)}
                readOnly
                tabIndex={-1}
                aria-label="경도"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn}>
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
