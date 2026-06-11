'use client';

import { useEffect, useRef } from 'react';
import { MAX_DELTA } from '../engine/constants';

/**
 * Drives a callback every animation frame with a delta in seconds.
 * Delta is clamped (background tabs, jank) so physics never teleports.
 *
 * The callback is kept in a ref so the rAF loop survives re-renders
 * without re-subscribing.
 */
export function useGameLoop(onFrame: (dt: number) => void): void {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_DELTA);
      last = now;
      onFrameRef.current(dt);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
}
