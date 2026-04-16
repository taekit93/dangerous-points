import { useState, useEffect } from 'react'
import { DEFAULT_CATEGORIES, DANGER_LEVELS, DANGER_COLORS, DANGER_BG_COLORS } from '../constants/categories'
import styles from './ObstacleForm.module.css'

export default function ObstacleForm({ formState, onSave, onClose }) {
  const isEdit = formState.mode === 'edit'
  const existing = formState.obstacle

  const [title, setTitle] = useState(existing?.title ?? '')
  const [category, setCategory] = useState(() => {
    if (!existing) return DEFAULT_CATEGORIES[0]
    return DEFAULT_CATEGORIES.includes(existing.category) ? existing.category : '직접입력'
  })
  const [customCategory, setCustomCategory] = useState(() => {
    if (!existing) return ''
    return DEFAULT_CATEGORIES.includes(existing.category) ? '' : existing.category
  })
  const [dangerLevel, setDangerLevel] = useState(existing?.dangerLevel ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [errors, setErrors] = useState({})

  const isCustomCategory = category === '직접입력'

  useEffect(() => {
    if (errors.title && title) setErrors((prev) => ({ ...prev, title: null }))
  }, [title, errors.title])

  useEffect(() => {
    if (errors.dangerLevel && dangerLevel) setErrors((prev) => ({ ...prev, dangerLevel: null }))
  }, [dangerLevel, errors.dangerLevel])

  function validate() {
    const next = {}
    if (!title.trim()) next.title = '제목을 입력해 주세요.'
    if (!dangerLevel) next.dangerLevel = '위험도를 선택해 주세요.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      ...(isEdit ? existing : {}),
      lat: formState.lat,
      lng: formState.lng,
      type: formState.type ?? 'point',
      coordinates: formState.coordinates ?? null,
      title: title.trim(),
      category: isCustomCategory ? customCategory.trim() || '기타' : category,
      dangerLevel,
      description: description.trim(),
    })
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{isEdit ? '장애물 수정' : '장애물 등록'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {formState.type && formState.type !== 'point' ? (
          <div className={styles.coords}>
            <span className={styles.coordsLabel}>
              {formState.type === 'line' ? '선' : '면'}
            </span>
            <span className={styles.coordsValue}>
              좌표 {formState.coordinates?.length}개
            </span>
          </div>
        ) : (
          <div className={styles.coords}>
            <span className={styles.coordsLabel}>위치</span>
            <span className={styles.coordsValue}>
              {formState.lat.toFixed(5)}, {formState.lng.toFixed(5)}
            </span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>
              제목 <span className={styles.required}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="장애물 제목을 입력하세요"
              autoFocus
            />
            {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>카테고리</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
              }}
            >
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="직접입력">직접 입력...</option>
            </select>
            {isCustomCategory && (
              <input
                className={styles.input}
                style={{ marginTop: 6 }}
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="카테고리를 입력하세요"
              />
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              위험도 <span className={styles.required}>*</span>
            </label>
            <div className={styles.dangerOptions}>
              {DANGER_LEVELS.map((level) => (
                <label
                  key={level}
                  className={`${styles.dangerOption} ${dangerLevel === level ? styles.selected : ''}`}
                  style={{
                    '--level-color': DANGER_COLORS[level],
                    '--level-bg': DANGER_BG_COLORS[level],
                  }}
                >
                  <input
                    type="radio"
                    name="dangerLevel"
                    value={level}
                    checked={dangerLevel === level}
                    onChange={() => setDangerLevel(level)}
                  />
                  {level}
                </label>
              ))}
            </div>
            {errors.dangerLevel && <span className={styles.errorMsg}>{errors.dangerLevel}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>설명</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 설명 (선택)"
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn}>
              {isEdit ? '수정 완료' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
