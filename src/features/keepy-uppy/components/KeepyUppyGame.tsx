'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMiniApp } from '@neynar/react';
import styles from './KeepyUppy.module.css';
import { GameCanvas, type GameCanvasHandle } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { GameOverPanel, type LeaderboardEntry } from './GameOverPanel';
import { StartPanel } from './StartPanel';
import type { GameSnapshot } from '../types';

const INITIAL_SNAPSHOT: GameSnapshot = {
  status: 'idle',
  score: 0,
  best: 0,
  streak: 0,
  isNewBest: false,
};

export function KeepyUppyGame() {
  const { context } = useMiniApp();
  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL_SNAPSHOT);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const submittedScoreRef = useRef<string>('');
  const canvasHandle = useRef<GameCanvasHandle>(null);

  const refreshLeaderboard = useCallback(async () => {
    const res = await fetch('/api/keepy-uppy/leaderboard?limit=10', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();
    setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
  }, []);


  useEffect(() => {
    const fid = context?.user?.fid;
    if (!fid) return;

    let cancelled = false;

    async function hydrateBestFromServer() {
      try {
        const res = await fetch(`/api/keepy-uppy/score?fid=${fid}`, { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json();
        const serverBest = data.entry?.score;

        if (!cancelled && Number.isFinite(serverBest)) {
          canvasHandle.current?.setBest(serverBest);
        }
      } catch (error) {
        console.error('Failed to hydrate keepy-uppy best score:', error);
      }
    }

    hydrateBestFromServer();

    return () => {
      cancelled = true;
    };
  }, [context?.user?.fid]);

  useEffect(() => {
    if (snapshot.status !== 'gameOver') return;

    const submitKey = `${context?.user?.fid ?? 'anon'}:${snapshot.score}:${snapshot.best}`;
    if (submittedScoreRef.current === submitKey) return;
    submittedScoreRef.current = submitKey;

    let cancelled = false;

    async function syncScore() {
      setLeaderboardStatus('loading');
      try {
        if (context?.user?.fid) {
          await fetch('/api/keepy-uppy/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
              score: Math.max(snapshot.score, snapshot.best),
            }),
          });
        }

        await refreshLeaderboard();
        if (!cancelled) setLeaderboardStatus('ready');
      } catch (error) {
        console.error('Failed to sync keepy-uppy leaderboard:', error);
        if (!cancelled) setLeaderboardStatus('error');
      }
    }

    syncScore();

    return () => {
      cancelled = true;
    };
  }, [context?.user, refreshLeaderboard, snapshot.best, snapshot.score, snapshot.status]);

  const handlePlayAgain = useCallback(() => {
    canvasHandle.current?.start();
  }, []);

  return (
    <div className={styles.screen}>
      <main className={styles.playfield}>
        <GameCanvas ref={canvasHandle} onSnapshot={setSnapshot} />
        <GameHUD snapshot={snapshot} />
        {snapshot.status === 'idle' && <StartPanel snapshot={snapshot} />}
        {snapshot.status === 'gameOver' && (
          <GameOverPanel
            snapshot={snapshot}
            leaderboard={leaderboard}
            leaderboardStatus={leaderboardStatus}
            currentFid={context?.user?.fid}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>
    </div>
  );
}
