import { BEST_SCORE_STORAGE_KEY } from './constants';

/**
 * Local-only high score for the MVP.
 * Wrapped in try/catch because localStorage can throw (private browsing,
 * embedded webviews, storage quotas) and SSR has no window at all.
 *
 * Future extension point: swap these two functions for an onchain or
 * backend-backed implementation without touching the rest of the game.
 */

export function loadBestScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    const parsed = raw === null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
  } catch {
    // Non-fatal: the run still works, the best just won't persist.
  }
}
