import { useState } from 'react'
import styles from './WishlistList.module.css'

const CATEGORIES = ['맛집', '카페', '관광지', '공원', '쇼핑', '문화/예술', '기타']

const CATEGORY_EMOJI = {
  맛집: '🍜',
  카페: '☕',
  관광지: '🏛',
  공원: '🌳',
  쇼핑: '🛍',
  '문화/예술': '🎨',
  기타: '📌',
}

/**
 * WishlistList — 검색·카테고리 필터·방문여부 필터 포함 위시리스트 목록
 *
 * Props:
 *   items      : WishlistListItem[]      — 전체 위시리스트 아이템
 *   onItemClick: (id: string) => void    — 아이템 클릭 시 상세 열기
 */
export default function WishlistList({ items, onItemClick }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('전체')
  const [visitFilter, setVisitFilter] = useState('전체')

  const filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.address ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchCategory =
      activeCategory === '전체' || item.category === activeCategory

    const matchVisit =
      visitFilter === '전체' ||
      (visitFilter === '미방문' && item.visitCount === 0) ||
      (visitFilter === '방문완료' && item.visitCount > 0)

    return matchSearch && matchCategory && matchVisit
  })

  function getEmptyMessage() {
    if (searchQuery) return '검색 결과가 없습니다.'
    if (activeCategory !== '전체' || visitFilter !== '전체') return '해당하는 장소가 없습니다.'
    return '등록된 위시리스트가 없습니다.'
  }

  return (
    <div className={styles.wishlistList}>
      {/* 검색 */}
      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="장소 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 필터 */}
      <div className={styles.filterBar}>
        {/* 카테고리 필터 */}
        <div className={styles.filterRow} role="group" aria-label="카테고리 필터">
          {['전체', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              className={`${styles.filterChip} ${activeCategory === cat ? styles.chipActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* 방문 여부 필터 */}
        <div className={styles.filterRow} role="group" aria-label="방문 여부 필터">
          {['전체', '미방문', '방문완료'].map((v) => (
            <button
              key={v}
              className={`${styles.filterChip} ${
                visitFilter === v
                  ? v === '방문완료'
                    ? styles.chipVisitActive
                    : styles.chipActive
                  : ''
              }`}
              onClick={() => setVisitFilter(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>{getEmptyMessage()}</div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((item) => (
            <li
              key={item.id}
              className={`${styles.item} ${item.visitCount > 0 ? styles.itemVisited : ''}`}
              onClick={() => onItemClick(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onItemClick(item.id)}
            >
              <div className={styles.itemIcon} aria-hidden="true">
                {CATEGORY_EMOJI[item.category] ?? '📌'}
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemTop}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.categoryBadge}>{item.category}</span>
                  <span
                    className={`${styles.visitCountBadge} ${
                      item.visitCount === 0 ? styles.badgeUnvisited : ''
                    }`}
                  >
                    {item.visitCount === 0 ? '미방문' : `${item.visitCount}회 방문`}
                  </span>
                </div>
                {item.address && (
                  <div className={styles.itemMeta}>
                    <span className={styles.itemAddress}>{item.address}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
