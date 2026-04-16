import styles from './DrawStatusBar.module.css';

const MIN_COORDS = { line: 2, polygon: 3 };
const MODE_LABEL = { line: '선', polygon: '면' };

export default function DrawStatusBar({ drawMode, coordCount, onComplete, onUndo, onCancel }) {
  if (drawMode === 'point') return null;

  const minRequired = MIN_COORDS[drawMode] ?? 2;
  const canComplete = coordCount >= minRequired;
  const modeLabel = MODE_LABEL[drawMode] ?? drawMode;

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <span className={styles.badge}>{modeLabel}</span>

      <span className={styles.coordText}>
        좌표 <span className={styles.coordCount}>{coordCount}</span>개 수집됨
      </span>

      <div className={styles.divider} />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onUndo}
          disabled={coordCount === 0}
          title="되돌리기"
          aria-label="마지막 좌표 되돌리기"
        >
          ↩
        </button>

        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onCancel}
          title="취소"
          aria-label="드로잉 취소"
        >
          ✕
        </button>

        <button
          type="button"
          className={styles.completeBtn}
          onClick={onComplete}
          disabled={!canComplete}
          title={canComplete ? '완료' : `${modeLabel}은 최소 ${minRequired}개 좌표가 필요합니다`}
          aria-label="드로잉 완료"
        >
          완료
        </button>
      </div>
    </div>
  );
}
