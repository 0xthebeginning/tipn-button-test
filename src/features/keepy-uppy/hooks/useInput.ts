'use client';

import { useEffect, type RefObject } from 'react';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../engine/constants';

/**
 * One-finger input: any pointerdown on the element fires `onTap` with
 * the tap position converted to logical playfield coordinates.
 *
 * Pointer events cover touch, mouse, and pen in one listener, and the
 * preventDefault keeps mobile browsers from double-tap zooming or
 * scrolling mid-rally (paired with touch-action: none in CSS).
 */
export function useInput(
  targetRef: RefObject<HTMLElement | null>,
  onTap: (logicalX: number, logicalY: number) => void,
): void {
  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const logicalX = ((event.clientX - rect.left) / rect.width) * LOGICAL_WIDTH;
      const logicalY = ((event.clientY - rect.top) / rect.height) * LOGICAL_HEIGHT;
      onTap(logicalX, logicalY);
    };

    el.addEventListener('pointerdown', handlePointerDown);
    return () => el.removeEventListener('pointerdown', handlePointerDown);
  }, [targetRef, onTap]);
}
