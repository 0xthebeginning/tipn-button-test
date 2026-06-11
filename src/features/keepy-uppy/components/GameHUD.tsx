'use client';

import Link from 'next/link';
import styles from './KeepyUppy.module.css';
import { BACK_TO_STICKERS_HREF } from './navigation';
import type { GameSnapshot } from '../types';

interface GameHUDProps {
  snapshot: GameSnapshot;
}

/**
 * Always-visible overlay: back link on the left, score + local best on
 * the right. The score only shows mid-run so the idle screen stays calm.
 */
export function GameHUD({ snapshot }: GameHUDProps) {
  return (
    <div className={styles.hud}>
      <Link href={BACK_TO_STICKERS_HREF} className={styles.backLink}>
        <span aria-hidden>←</span> Stickers
      </Link>

      {snapshot.status === 'playing' && (
        <div className={styles.scoreBox} aria-live="polite">
          <span className={styles.score}>{snapshot.score}</span>
          <span className={styles.best}>Best {snapshot.best}</span>
        </div>
      )}
    </div>
  );
}
