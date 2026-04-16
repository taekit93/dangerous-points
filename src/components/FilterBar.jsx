import { DEFAULT_CATEGORIES, DANGER_LEVELS, DANGER_COLORS } from '../constants/categories'
import styles from './FilterBar.module.css'

export default function FilterBar({
  selectedCategories,
  selectedDangerLevels,
  obstacles,
  onCategoryChange,
  onDangerLevelChange,
}) {
  const registeredCategories = obstacles.map((o) => o.category)
  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...registeredCategories])]

  function toggleCategory(cat) {
    if (selectedCategories.includes(cat)) {
      onCategoryChange(selectedCategories.filter((c) => c !== cat))
    } else {
      onCategoryChange([...selectedCategories, cat])
    }
  }

  function toggleDangerLevel(level) {
    if (selectedDangerLevels.includes(level)) {
      onDangerLevelChange(selectedDangerLevels.filter((l) => l !== level))
    } else {
      onDangerLevelChange([...selectedDangerLevels, level])
    }
  }

  function clearAll() {
    onCategoryChange([])
    onDangerLevelChange([])
  }

  const hasFilter = selectedCategories.length > 0 || selectedDangerLevels.length > 0

  return (
    <div className={styles.filterBar}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>카테고리</span>
          {hasFilter && (
            <button className={styles.clearBtn} onClick={clearAll}>
              초기화
            </button>
          )}
        </div>
        <div className={styles.chips}>
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`${styles.chip} ${selectedCategories.includes(cat) ? styles.chipActive : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>위험도</span>
        </div>
        <div className={styles.chips}>
          {DANGER_LEVELS.map((level) => (
            <button
              key={level}
              className={`${styles.chip} ${selectedDangerLevels.includes(level) ? styles.chipDangerActive : ''}`}
              style={
                selectedDangerLevels.includes(level)
                  ? { '--chip-color': DANGER_COLORS[level] }
                  : {}
              }
              onClick={() => toggleDangerLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
