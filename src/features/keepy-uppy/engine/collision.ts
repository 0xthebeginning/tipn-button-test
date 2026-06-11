import { HIT_POINT_ABOVE_GROUND, HIT_RADIUS } from './constants';
import type { Ball, Bounds, Vec2 } from '../types';

/** The point Superinu boops from — just above the head, bottom center. */
export function getHitPoint(bounds: Bounds, dogX = bounds.width / 2): Vec2 {
  return {
    x: dogX,
    y: bounds.groundY - HIT_POINT_ABOVE_GROUND,
  };
}

export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/**
 * A tap succeeds if the ball's center is within HIT_RADIUS of the hit
 * point. The ball's own radius is added so grazing contact still counts —
 * cozy beats strict.
 */
export function isBallInHitZone(ball: Ball, bounds: Bounds, dogX?: number): boolean {
  const hitPoint = getHitPoint(bounds, dogX);
  return distance(ball, hitPoint) <= HIT_RADIUS + ball.radius * 0.5;
}
