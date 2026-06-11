import {
  BALL_RADIUS,
  BALL_SPAWN_Y_FRACTION,
  BASE_GRAVITY,
  BASE_MAX_DRIFT,
  BOUNCE_GRAVITY_COMPENSATION,
  BOUNCE_POWER,
  COZY_ASSIST_FROM_Y_FRACTION,
  COZY_ASSIST_PULL,
  DOG_HOP_DURATION,
  DOG_WIDTH,
  DRIFT_STEP_PER_10_POINTS,
  GRAVITY_STEP_PER_10_POINTS,
  GROUND_HEIGHT,
  HIT_COOLDOWN,
  HIT_VX_DAMPING,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  MAX_GRAVITY,
  MAX_MAX_DRIFT,
  SHAKE_DURATION,
  SIDE_FORCE,
  SQUASH_ON_HIT,
  SQUASH_RECOVERY_RATE,
} from './constants';
import { isBallInHitZone } from './collision';
import { clampDrift, hasHitGround, stepBall } from './physics';
import { loadBestScore, saveBestScore } from './scoring';
import type { Ball, Bounds, GameEvent, GameState } from '../types';

/* ------------------------------------------------------------------ */
/* Difficulty                                                          */
/* ------------------------------------------------------------------ */

/** Gravity rises a notch every 10 points, capped to stay cozy. */
export function gravityForScore(score: number): number {
  const ramp = Math.floor(score / 10) * GRAVITY_STEP_PER_10_POINTS;
  return Math.min(BASE_GRAVITY + ramp, MAX_GRAVITY);
}

/** Allowed horizontal drift also grows gently with score. */
export function maxDriftForScore(score: number): number {
  const ramp = Math.floor(score / 10) * DRIFT_STEP_PER_10_POINTS;
  return Math.min(BASE_MAX_DRIFT + ramp, MAX_MAX_DRIFT);
}

/* ------------------------------------------------------------------ */
/* Construction / reset                                                */
/* ------------------------------------------------------------------ */

export function createBounds(): Bounds {
  return {
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
    groundY: LOGICAL_HEIGHT - GROUND_HEIGHT,
  };
}

function createBall(bounds: Bounds): Ball {
  return {
    x: bounds.width / 2,
    y: bounds.height * BALL_SPAWN_Y_FRACTION,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    rotation: 0,
    squash: 1,
  };
}

export function createInitialState(): GameState {
  const bounds = createBounds();
  return {
    status: 'idle',
    ball: createBall(bounds),
    bounds,
    score: 0,
    best: loadBestScore(),
    streak: 0,
    elapsed: 0,
    hitCooldown: 0,
    idlePhase: 0,
    dogX: bounds.width / 2,
    dogHop: 0,
    shake: 0,
  };
}

/** idle/gameOver -> playing. Ball drops fresh from the spawn point. */
export function startGame(state: GameState): void {
  state.ball = createBall(state.bounds);
  state.score = 0;
  state.streak = 0;
  state.elapsed = 0;
  state.hitCooldown = 0;
  state.dogX = state.bounds.width / 2;
  state.shake = 0;
  state.status = 'playing';
}

/* ------------------------------------------------------------------ */
/* Per-frame tick                                                      */
/* ------------------------------------------------------------------ */

/**
 * Advance the whole game one frame. Deterministic: same state + same dt
 * always produces the same result. Returns events for the renderer.
 */
export function tick(state: GameState, dt: number): GameEvent[] {
  const events: GameEvent[] = [];
  const { ball, bounds } = state;

  // Timers shared across states.
  state.dogHop = Math.max(0, state.dogHop - dt / DOG_HOP_DURATION);
  state.shake = Math.max(0, state.shake - dt / SHAKE_DURATION);
  if (ball.squash < 1) {
    ball.squash = Math.min(1, ball.squash + SQUASH_RECOVERY_RATE * dt);
  }

  if (state.status === 'idle') {
    // Gentle floating preview: a sine bob, no real physics.
    state.idlePhase += dt;
    ball.x = bounds.width / 2;
    state.dogX = ball.x;
    ball.y =
      bounds.height * BALL_SPAWN_Y_FRACTION +
      Math.sin(state.idlePhase * 1.8) * 14;
    ball.rotation += dt * 0.5;
    return events;
  }

  if (state.status !== 'playing') return events;

  state.elapsed += dt;
  state.hitCooldown = Math.max(0, state.hitCooldown - dt);

  // Cozy assist: while falling through the lower part of the screen,
  // drift gently back toward center so the ball never strands at a wall.
  if (ball.vy > 0 && ball.y > bounds.height * COZY_ASSIST_FROM_Y_FRACTION) {
    ball.vx += (bounds.width / 2 - ball.x) * COZY_ASSIST_PULL * dt;
  }

  clampDrift(ball, maxDriftForScore(state.score));
  events.push(...stepBall(ball, gravityForScore(state.score), dt, bounds));

  // Keep controls one-button: Super Inu automatically lines up under the ball.
  const dogHalfWidth = DOG_WIDTH / 2;
  state.dogX = Math.max(dogHalfWidth, Math.min(bounds.width - dogHalfWidth, ball.x));

  if (hasHitGround(ball, bounds)) {
    ball.y = bounds.groundY - ball.radius;
    ball.squash = SQUASH_ON_HIT; // flatten on the sad landing too
    state.status = 'gameOver';
    state.shake = 1;

    const isNewBest = state.score > state.best;
    if (isNewBest) {
      state.best = state.score;
      saveBestScore(state.best);
    }
    events.push({
      type: 'gameOver',
      score: state.score,
      best: state.best,
      isNewBest,
    });
  }

  return events;
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

/**
 * Player tapped at logical x position `tapX`. If the ball is in the hit
 * zone, boop it upward; tap position steers it (tap left -> ball goes
 * right, tap right -> ball goes left, center -> mostly vertical).
 * A miss costs nothing — the only way to lose is the ground.
 */
export function attemptHit(state: GameState, tapX: number): GameEvent[] {
  if (state.status !== 'playing') return [];

  const { ball, bounds } = state;
  state.dogHop = 1; // Super Inu always tries — little hop on every tap

  if (state.hitCooldown > 0 || !isBallInHitZone(ball, bounds, state.dogX)) {
    return [{ type: 'miss', x: tapX, y: ball.y }];
  }

  // Success!
  state.score += 1;
  state.streak += 1;
  state.hitCooldown = HIT_COOLDOWN;

  const gravity = gravityForScore(state.score);
  const gravityBoost = (gravity - BASE_GRAVITY) * BOUNCE_GRAVITY_COMPENSATION;
  ball.vy = -(BOUNCE_POWER + gravityBoost);

  // -1 (tap at right edge) .. +1 (tap at left edge): inverse steering.
  const steer = (bounds.width / 2 - tapX) / (bounds.width / 2);
  ball.vx = ball.vx * HIT_VX_DAMPING + steer * SIDE_FORCE;
  clampDrift(ball, maxDriftForScore(state.score));

  ball.squash = SQUASH_ON_HIT;

  return [
    {
      type: 'hit',
      x: ball.x,
      y: ball.y,
      score: state.score,
      streak: state.streak,
    },
  ];
}
