/**
 * Shared types for the Keepy-Uppy game.
 * Pure data — no React, no DOM — so the engine stays portable
 * (e.g. if this feature graduates into its own miniapp later).
 */

export type GameStatus = 'idle' | 'playing' | 'gameOver';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  /** Visual rotation in radians (rendering only, doesn't affect physics). */
  rotation: number;
  /** 1 = round. <1 = squashed (hit feedback). Recovers toward 1 each frame. */
  squash: number;
}

/** Logical playfield bounds. Rendering scales this to the real canvas. */
export interface Bounds {
  width: number;
  height: number;
  /** Y coordinate of the ground line (ball dies at y + radius >= groundY). */
  groundY: number;
}

export interface GameState {
  status: GameStatus;
  ball: Ball;
  bounds: Bounds;
  score: number;
  best: number;
  streak: number;
  /** Seconds elapsed in the current run. */
  elapsed: number;
  /** Seconds remaining before another hit can register (anti double-tap). */
  hitCooldown: number;
  /** Idle-mode bob phase, so the preview ball floats gently. */
  idlePhase: number;
  /** Countdown driving the dog's little hop animation. */
  dogHop: number;
  /** Countdown driving game-over screen shake. */
  shake: number;
}

/**
 * Events emitted by engine steps so the renderer can add juice
 * (sparkles, "boop!" text, shake) without the engine knowing about pixels.
 */
export type GameEvent =
  | { type: 'hit'; x: number; y: number; score: number; streak: number }
  | { type: 'miss'; x: number; y: number }
  | { type: 'wallBounce'; side: 'left' | 'right' }
  | { type: 'gameOver'; score: number; best: number; isNewBest: boolean };

/** Snapshot of React-relevant state, mirrored out of the engine each frame. */
export interface GameSnapshot {
  status: GameStatus;
  score: number;
  best: number;
  streak: number;
  isNewBest: boolean;
}
