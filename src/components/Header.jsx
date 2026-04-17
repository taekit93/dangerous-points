import styles from './Header.module.css'

/**
 * Header
 *
 * Props:
 *   count               : number                              — 현재 모드 아이템 수
 *   onToggleSidebar     : () => void                          — 사이드바 토글
 *   activeMode          : 'obstacle' | 'wishlist'             — 현재 활성 모드
 *   onModeChange        : (mode: 'obstacle' | 'wishlist') => void — 탭 클릭 콜백
 *   onGeoJsonImport     : () => void                          — GeoJSON 가져오기 버튼 콜백
 */
export default function Header({ count, onToggleSidebar, activeMode = 'obstacle', onModeChange, onGeoJsonImport }) {
  const countLabel =
    activeMode === 'wishlist' ? `${count}곳` : `${count}개`

  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={onToggleSidebar} aria-label="메뉴 열기">
        <span className={styles.menuIcon} />
        <span className={styles.menuIcon} />
        <span className={styles.menuIcon} />
      </button>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>⚠</span>
        <span className={styles.brandText}>장애물 지도</span>
      </div>

      {/* 모드 전환 탭 */}
      <div className={styles.tabs} role="tablist" aria-label="기능 모드">
        <button
          className={`${styles.tab} ${activeMode === 'obstacle' ? styles.tabActive : ''}`}
          role="tab"
          aria-selected={activeMode === 'obstacle'}
          onClick={() => onModeChange?.('obstacle')}
        >
          장애물
        </button>
        <button
          className={`${styles.tab} ${activeMode === 'wishlist' ? `${styles.tabActive} ${styles.tabWish}` : ''}`}
          role="tab"
          aria-selected={activeMode === 'wishlist'}
          onClick={() => onModeChange?.('wishlist')}
        >
          위시리스트
        </button>
      </div>

      <span className={styles.count}>{countLabel}</span>

      {onGeoJsonImport && (
        <button
          className={styles.importBtn}
          onClick={onGeoJsonImport}
          aria-label="GeoJSON 가져오기"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1v9M4 6l4 4 4-4M2 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.importBtnText}>GeoJSON 가져오기</span>
        </button>
      )}
    </header>
  )
}
