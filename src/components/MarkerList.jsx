import { useState } from 'react'
import { DANGER_COLORS, DANGER_BG_COLORS } from '../constants/categories'
import styles from './MarkerList.module.css'

const TYPE_LABEL = { point: '점', line: '선', polygon: '면' }

export default function MarkerList({ obstacles, activeMarkerId, onSelect, onDelete }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = obstacles.filter(
    (o) =>
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.markerList}>
      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="장애물 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {searchQuery ? '검색 결과가 없습니다.' : '등록된 장애물이 없습니다.'}
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((obstacle) => (
            <li
              key={obstacle.id}
              className={`${styles.item} ${activeMarkerId === obstacle.id ? styles.itemActive : ''}`}
              onClick={() => onSelect(obstacle.id)}
            >
              <div
                className={styles.dangerDot}
                style={{ background: DANGER_COLORS[obstacle.dangerLevel] }}
              />
              <div className={styles.itemContent}>
                <div className={styles.itemTop}>
                  <span className={styles.itemTitle}>{obstacle.title}</span>
                  <span className={styles.typeBadge}>
                    {TYPE_LABEL[obstacle.type] ?? '점'}
                  </span>
                  <span
                    className={styles.dangerBadge}
                    style={{
                      background: DANGER_BG_COLORS[obstacle.dangerLevel],
                      color: DANGER_COLORS[obstacle.dangerLevel],
                    }}
                  >
                    {obstacle.dangerLevel}
                  </span>
                </div>
                <div className={styles.itemMeta}>
                  <span className={styles.category}>{obstacle.category}</span>
                  <span className={styles.date}>
                    {new Date(obstacle.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(obstacle.id)
                }}
                aria-label="삭제"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
