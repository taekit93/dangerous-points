import styles from './Header.module.css'

export default function Header({ count, onToggleSidebar }) {
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
      <span className={styles.count}>{count}개</span>
    </header>
  )
}
