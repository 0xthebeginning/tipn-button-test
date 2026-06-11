import { WALL_RESTITUTION } from './constants';
import type { Ball, Bounds, GameEvent } from '../types';

/**
 * Advance the ball one frame. Deterministic and side-effect free apart
 * from mutating the ball it was given (cheap + GC-friendly for a 60fps loop).
 *
 * Returns wall-bounce events so the renderer can react if it wants to.
 */
export function stepBall(
  ball: Ball,
  gravity: number,
  dt: number,
  bounds: Bounds,
): GameEvent[] {
  const events: GameEvent[] = [];

  // Integrate (semi-implicit Euler: velocity first, then position).
  ball.vy += gravity * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Rolling-in-air feel: rotation follows horizontal motion.
  ball.rotation += (ball.vx / ball.radius) * dt * 0.6;

  // Light bounce off side walls, then clamp inside the canvas.
  const minX = ball.radius;
  const maxX = bounds.width - ball.radius;
  if (ball.x < minX) {
    ball.x = minX;
    ball.vx = Math.abs(ball.vx) * WALL_RESTITUTION;
    events.push({ type: 'wallBounce', side: 'left' });
  } else if (ball.x > maxX) {
    ball.x = maxX;
    ball.vx = -Math.abs(ball.vx) * WALL_RESTITUTION;
    events.push({ type: 'wallBounce', side: 'right' });
  }

  // Never let the ball escape out of the top.
  if (ball.y < ball.radius) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy) * 0.3;
  }

  return events;
}

/** Clamp horizontal speed so drift stays within the cozy cap. */
export function clampDrift(ball: Ball, maxDrift: number): void {
  if (ball.vx > maxDrift) ball.vx = maxDrift;
  else if (ball.vx < -maxDrift) ball.vx = -maxDrift;
}

/** True once the ball has touched the ground line. */
export function hasHitGround(ball: Ball, bounds: Bounds): boolean {
  return ball.y + ball.radius >= bounds.groundY;
}
