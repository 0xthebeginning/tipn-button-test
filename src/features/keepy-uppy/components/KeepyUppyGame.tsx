'use client';

import { useCallback, useRef, useState } from 'react';
import styles from './KeepyUppy.module.css';
import { GameCanvas, type GameCanvasHandle } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { GameOverPanel } from './GameOverPanel';
import { StartPanel } from './StartPanel';
import type { GameSnapshot } from '../types';

const INITIAL_SNAPSHOT: GameSnapshot = {
  status: 'idle',
  score: 0,
  best: 0,
  streak: 0,
  isNewBest: false,
};

/**
 * The whole Keepy-Uppy screen. The engine lives inside GameCanvas (refs,
 * no re-renders at 60fps); this component only holds the lightweight
 * snapshot that drives the HUD and the idle / game-over panels.
 *
 * Self-contained on purpose: the /keepy-uppy route just renders this,
 * and the rest of the Super Inu miniapp never imports anything deeper.
 */
export function KeepyUppyGame() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL_SNAPSHOT);
  const canvasHandle = useRef<GameCanvasHandle>(null);

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
          <GameOverPanel snapshot={snapshot} onPlayAgain={handlePlayAgain} />
        )}
      </main>
    </div>
  );
}
