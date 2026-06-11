/**
 * Every tunable number in one place.
 * Units: logical pixels (see LOGICAL_WIDTH/HEIGHT) and seconds.
 * The canvas scales the logical playfield to the device, so these
 * behave identically on every screen size.
 */

/** Logical playfield size — portrait, roughly a phone aspect ratio. */
export const LOGICAL_WIDTH = 390;
export const LOGICAL_HEIGHT = 640;

/** Height of the grass band at the bottom. Ground line sits on top of it. */
export const GROUND_HEIGHT = 72;

/** Ball */
export const BALL_RADIUS = 26;
export const BALL_SPAWN_Y_FRACTION = 0.3; // spawn at 30% of screen height

/** Gravity (logical px / s²). Starts forgiving, ramps gently, hard-capped. */
export const BASE_GRAVITY = 1350;
export const GRAVITY_STEP_PER_10_POINTS = 95;
export const MAX_GRAVITY = 2150;

/** Hit tuning */
export const HIT_RADIUS = 122; // distance from hit point for a tap to land
export const BOUNCE_POWER = 1060; // upward speed applied on a successful hit
/** Extra upward power as gravity rises, so the ball stays reachable. */
export const BOUNCE_GRAVITY_COMPENSATION = 0.34;
/** Horizontal speed added per unit of tap offset from canvas center. */
export const SIDE_FORCE = 290;
/** How much existing horizontal speed survives a hit (keeps things tame). */
export const HIT_VX_DAMPING = 0.45;
/** Seconds after a successful hit before another can register. */
export const HIT_COOLDOWN = 0.22;

/** Walls */
export const WALL_RESTITUTION = 0.55; // light bounce off side walls

/** Horizontal drift cap. Grows with score, stays cozy. */
export const BASE_MAX_DRIFT = 240;
export const DRIFT_STEP_PER_10_POINTS = 26;
export const MAX_MAX_DRIFT = 420;

/**
 * Cozy assist: when the ball is falling through the lower half of the
 * screen, nudge it gently toward center so it never strands at a wall
 * out of reach. Small on purpose — it should feel like luck, not rails.
 */
export const COZY_ASSIST_PULL = 0.6; // per second, proportional to offset
export const COZY_ASSIST_FROM_Y_FRACTION = 0.45;

/** Dog placement (relative to ground line) */
export const DOG_WIDTH = 132;
export const DOG_HEIGHT = 128;
/** The hit point floats just above Superinu's head. */
export const HIT_POINT_ABOVE_GROUND = 142;

/** Juice timings (seconds) */
export const SQUASH_ON_HIT = 0.62; // ball squash factor at moment of impact
export const SQUASH_RECOVERY_RATE = 4.5; // per second, back toward 1
export const DOG_HOP_DURATION = 0.28;
export const SHAKE_DURATION = 0.45;
export const SHAKE_MAGNITUDE = 7;

/** Frame-time clamp so a background tab doesn't teleport the ball. */
export const MAX_DELTA = 1 / 30;

/** localStorage key for the local best score. */
export const BEST_SCORE_STORAGE_KEY = 'super-inu-keepy-uppy:best';

/**
 * Asset paths — isolated here so swapping in real art is a one-line change.
 * Drop the real sticker at `public/assets/keepy-uppy/super-inu.png` in the
 * repo and it will be used automatically; until then the renderer draws a
 * built-in vector Superinu so the game works with zero binary assets.
 */
export const ASSET_PATHS = {
  superInu: '/assets/keepy-uppy/super-inu.png',
  soccerBall: '/assets/keepy-uppy/soccer-ball.png',
} as const;

/** Little celebration words that pop on successful hits. */
export const BOOP_WORDS = ['boop!', 'yip!', 'nice!', 'wow!', 'pow!'] as const;
