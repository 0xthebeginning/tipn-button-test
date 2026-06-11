'use client';

import styles from './KeepyUppy.module.css';
import type { GameSnapshot } from '../types';

interface StartPanelProps {
  snapshot: GameSnapshot;
}

/**
 * Idle screen. Deliberately pointer-events: none — the spec wants "tap
 * anywhere to start", so taps fall straight through to the canvas while
 * the ball bobs in its preview behind the text.
 */
export function StartPanel({ snapshot }: StartPanelProps) {
  return (
    <div className={`${styles.panel} ${styles.panelPassthrough}`}>
      <h1 className={styles.title}>
        Superinu
        <span className={styles.titleAccent}>Keepy-Uppy</span>
      </h1>
      <p className={styles.hint}>
        Keep the ball off the grass. Tap when it drops near Superinu —
        boop it back up!
      </p>
      <div className={styles.tapToStart}>Tap to Start</div>
      {snapshot.best > 0 && (
        <span className={styles.best}>Best {snapshot.best}</span>
      )}
    </div>
  );
}
