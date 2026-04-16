import { Fragment } from 'react';
import styles from './DrawToolbar.module.css';

const MODES = [
  { key: 'point', icon: '●', label: '점' },
  { key: 'line',  icon: '╱', label: '선' },
  { key: 'polygon', icon: '▱', label: '면' },
];

export default function DrawToolbar({ drawMode, onModeChange }) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="드로잉 타입 선택">
      {MODES.map((mode, idx) => (
        <Fragment key={mode.key}>
          {idx > 0 && <div className={styles.divider} />}
          <button
            type="button"
            className={`${styles.btn} ${drawMode === mode.key ? styles.active : ''}`}
            onClick={() => onModeChange(mode.key)}
            aria-pressed={drawMode === mode.key}
            title={mode.label}
          >
            <span className={styles.icon} aria-hidden="true">{mode.icon}</span>
            <span className={styles.label}>{mode.label}</span>
          </button>
        </Fragment>
      ))}
    </div>
  );
}
