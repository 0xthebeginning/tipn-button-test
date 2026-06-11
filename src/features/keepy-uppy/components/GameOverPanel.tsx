'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import styles from './KeepyUppy.module.css';
import { BACK_TO_STICKERS_HREF } from './navigation';
import type { GameSnapshot } from '../types';

export interface LeaderboardEntry {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  score: number;
  updatedAt: number;
}

interface GameOverPanelProps {
  snapshot: GameSnapshot;
  leaderboard: LeaderboardEntry[];
  leaderboardStatus: 'idle' | 'loading' | 'ready' | 'error';
  currentFid?: number;
  onPlayAgain: () => void;
}

export function GameOverPanel({
  snapshot,
  leaderboard,
  leaderboardStatus,
  currentFid,
  onPlayAgain,
}: GameOverPanelProps) {
  const [shared, setShared] = useState(false);

  const handleShare = useCallback(async () => {
    const text = `I kept the ball up ${snapshot.score} time${
      snapshot.score === 1 ? '' : 's'
    } in Superinu Keepy-Uppy! ⚽🐕 Can you beat my score?`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {
      // User dismissed the share sheet.
    }
  }, [snapshot.score]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelCard}>
        <h2 className={styles.gameOverLabel}>Nice rally!</h2>
        <div className={styles.finalScore}>{snapshot.score}</div>
        {snapshot.isNewBest ? (
          <span className={styles.newBest}>★ New best!</span>
        ) : (
          <span className={styles.bestLine}>Best {snapshot.best}</span>
        )}

        <div className={styles.leaderboard}>
          <div className={styles.leaderboardTitle}>Leaderboard</div>
          {leaderboardStatus === 'loading' && (
            <div className={styles.leaderboardMeta}>Syncing score…</div>
          )}
          {leaderboardStatus === 'error' && (
            <div className={styles.leaderboardMeta}>Leaderboard unavailable</div>
          )}
          {leaderboardStatus !== 'loading' && leaderboard.length === 0 && (
            <div className={styles.leaderboardMeta}>No scores yet</div>
          )}
          {leaderboard.length > 0 && (
            <ol className={styles.leaderboardList}>
              {leaderboard.slice(0, 10).map((entry, index) => {
                const name = entry.displayName || entry.username || `FID ${entry.fid}`;
                const isCurrent = currentFid === entry.fid;
                return (
                  <li
                    key={entry.fid}
                    className={`${styles.leaderboardRow} ${
                      isCurrent ? styles.leaderboardRowCurrent : ''
                    }`}
                  >
                    <span className={styles.leaderboardRank}>{index + 1}</span>
                    {entry.pfpUrl ? (
                      <img src={entry.pfpUrl} alt="" className={styles.leaderboardAvatar} />
                    ) : (
                      <span className={styles.leaderboardAvatarFallback}>🐕</span>
                    )}
                    <span className={styles.leaderboardName}>{name}</span>
                    <span className={styles.leaderboardScore}>{entry.score}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className={styles.buttons}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={onPlayAgain}
            autoFocus
          >
            Play Again
          </button>
          <Link href={BACK_TO_STICKERS_HREF} className={styles.button}>
            Back to Stickers
          </Link>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={handleShare}
          >
            {shared ? 'Copied!' : 'Share Score'}
          </button>
        </div>
      </div>
    </div>
  );
}
