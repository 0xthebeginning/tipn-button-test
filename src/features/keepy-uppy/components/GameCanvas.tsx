"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
} from "react";
import {
  ASSET_PATHS,
  BOOP_WORDS,
  DOG_HEIGHT,
  DOG_WIDTH,
  HIT_RADIUS,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  SHAKE_MAGNITUDE,
} from "../engine/constants";
import { getHitPoint, isBallInHitZone } from "../engine/collision";
import {
  attemptHit,
  createInitialState,
  startGame,
  tick,
} from "../engine/gameState";
import { useGameLoop } from "../hooks/useGameLoop";
import { useInput } from "../hooks/useInput";
import type { Ball, GameEvent, GameSnapshot, GameState } from "../types";

/* ================================================================== */
/* Palette — warm, cozy, Super Inu colors                              */
/* ================================================================== */

const COLORS = {
  skyTop: "#8fdcff",
  skyBottom: "#dfffd7",
  cloud: "rgba(255, 255, 245, 0.86)",
  grass: "#9ccb86",
  grassDark: "#7fb56c",
  dirt: "#d9a86a",
  inuOrange: "#58c847",
  inuOrangeDark: "#2f8f35",
  inuCream: "#d8ffd1",
  inuLine: "#103f22",
  ballWhite: "#fffdf6",
  ballPatch: "#4a3b32",
  ballLine: "#e8ddcc",
  boop: "#20a83a",
  glow: "rgba(255, 200, 120, 0.0)",
  glowActive: "rgba(88, 200, 71, 0.42)",
} as const;

/* ================================================================== */
/* Renderer-only juice state (random is fine here — physics stays      */
/* deterministic; this never feeds back into the engine)               */
/* ================================================================== */

interface BoopText {
  x: number;
  y: number;
  text: string;
  age: number; // seconds
  tilt: number;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  hue: string;
}

interface JuiceState {
  boops: BoopText[];
  sparkles: Sparkle[];
  wagPhase: number;
  wagBoost: number; // tail wags faster right after a hit
  time: number;
}

const BOOP_LIFETIME = 0.8;
const SPARKLE_LIFETIME = 0.6;

/* ================================================================== */
/* Component                                                           */
/* ================================================================== */

export interface GameCanvasHandle {
  /** Begin a fresh run (used by the game-over panel's Play Again). */
  start: () => void;
}

interface GameCanvasProps {
  /** Mirrors engine state out to React (HUD + panels) when it changes. */
  onSnapshot: (snapshot: GameSnapshot) => void;
  /** React 19 ref-as-prop: exposes the imperative `start()` handle. */
  ref?: Ref<GameCanvasHandle>;
}

export function GameCanvas({ onSnapshot, ref }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const juiceRef = useRef<JuiceState>({
    boops: [],
    sparkles: [],
    wagPhase: 0,
    wagBoost: 0,
    time: 0,
  });
  const lastSnapshotRef = useRef<string>("");
  const isNewBestRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const spritesRef = useRef<{
    dog: HTMLImageElement | null;
    ball: HTMLImageElement | null;
  }>({ dog: null, ball: null });

  /* ----- best score + sprites + reduced-motion: client-only init ---- */
  useEffect(() => {
    // createInitialState ran during render where localStorage may be
    // unavailable (SSR); refresh `best` now that we're on the client.
    stateRef.current = createInitialState();
    emitSnapshot();

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Optional art: if the real sticker PNGs exist in /public they are
    // used; otherwise the built-in vector Super Inu below draws instead.
    const tryLoad = (src: string, key: "dog" | "ball") => {
      const img = new Image();
      img.onload = () => {
        spritesRef.current[key] = img;
      };
      img.onerror = () => {
        spritesRef.current[key] = null;
      };
      img.src = src;
    };
    tryLoad(ASSET_PATHS.superInu, "dog");
    tryLoad(ASSET_PATHS.soccerBall, "ball");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- snapshot mirroring ----------------------------------------- */
  const emitSnapshot = useCallback(() => {
    const s = stateRef.current;
    const snapshot: GameSnapshot = {
      status: s.status,
      score: s.score,
      best: s.best,
      streak: s.streak,
      isNewBest: isNewBestRef.current,
    };
    const key = `${snapshot.status}|${snapshot.score}|${snapshot.best}|${snapshot.streak}|${snapshot.isNewBest}`;
    if (key !== lastSnapshotRef.current) {
      lastSnapshotRef.current = key;
      onSnapshot(snapshot);
    }
  }, [onSnapshot]);

  /* ----- event -> juice --------------------------------------------- */
  const handleEvents = useCallback((events: GameEvent[]) => {
    const juice = juiceRef.current;
    for (const event of events) {
      if (event.type === "hit") {
        juice.wagBoost = 1;
        juice.boops.push({
          x: event.x,
          y: event.y - 36,
          text: BOOP_WORDS[event.score % BOOP_WORDS.length],
          age: 0,
          tilt: (Math.random() - 0.5) * 0.5,
        });
        if (!reducedMotionRef.current) {
          for (let i = 0; i < 7; i++) {
            const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.5;
            const speed = 120 + Math.random() * 120;
            juice.sparkles.push({
              x: event.x,
              y: event.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 60,
              age: 0,
              hue: i % 2 === 0 ? "#ffd166" : COLORS.boop,
            });
          }
        }
      } else if (event.type === "gameOver") {
        isNewBestRef.current = event.isNewBest;
        if (reducedMotionRef.current) stateRef.current.shake = 0;
      }
    }
  }, []);

  /* ----- input -------------------------------------------------------- */
  const handleTap = useCallback(
    (logicalX: number) => {
      const state = stateRef.current;
      if (state.status === "idle") {
        startGame(state);
      } else if (state.status === "playing") {
        handleEvents(attemptHit(state, logicalX));
      }
      // gameOver taps are ignored: restarting goes through the panel
      // buttons so a frantic last tap can't instantly skip the results.
      emitSnapshot();
    },
    [emitSnapshot, handleEvents],
  );

  useInput(wrapperRef, handleTap);

  /* ----- imperative API for panels ------------------------------------ */
  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        isNewBestRef.current = false;
        startGame(stateRef.current);
        emitSnapshot();
      },
    }),
    [emitSnapshot],
  );

  /* ----- keyboard fallback (quality floor, not a spec requirement) ---- */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        handleTap(LOGICAL_WIDTH / 2);
      }
    },
    [handleTap],
  );

  /* ----- frame loop: tick engine, advance juice, draw ------------------ */
  useGameLoop((dt) => {
    const state = stateRef.current;
    handleEvents(tick(state, dt));
    emitSnapshot();

    const juice = juiceRef.current;
    juice.time += dt;
    juice.wagBoost = Math.max(0, juice.wagBoost - dt * 2.2);
    juice.wagPhase += dt * (5 + juice.wagBoost * 14);
    juice.boops = juice.boops.filter((b) => (b.age += dt) < BOOP_LIFETIME);
    juice.sparkles = juice.sparkles.filter((s) => {
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 500 * dt;
      return s.age < SPARKLE_LIFETIME;
    });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) draw(ctx, canvas, state, juice, spritesRef.current);
  });

  return (
    <div
      ref={wrapperRef}
      role="application"
      aria-label="Super Inu Keepy-Uppy game. Tap or press space to bounce the ball."
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: "absolute",
        inset: 0,
        touchAction: "none",
        cursor: "pointer",
        outline: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

/* ================================================================== */
/* Drawing — pure functions of (state, juice), no engine mutation      */
/* ================================================================== */

function draw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: GameState,
  juice: JuiceState,
  sprites: { dog: HTMLImageElement | null; ball: HTMLImageElement | null },
): void {
  // Keep the backing store matched to display size * devicePixelRatio.
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const rect = canvas.getBoundingClientRect();
  const targetW = Math.max(1, Math.round(rect.width * dpr));
  const targetH = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  // Map the logical 390x640 playfield onto the canvas.
  const scaleX = canvas.width / LOGICAL_WIDTH;
  const scaleY = canvas.height / LOGICAL_HEIGHT;
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

  // Screen shake (game over only).
  if (state.shake > 0) {
    const s = state.shake * SHAKE_MAGNITUDE;
    ctx.translate(Math.sin(juice.time * 70) * s, Math.cos(juice.time * 53) * s);
  }

  drawSky(ctx, juice.time);
  drawHitZoneGlow(ctx, state);
  drawGround(ctx, state);
  drawDog(ctx, state, juice, sprites.dog);
  drawBall(ctx, state.ball, sprites.ball);
  drawSparkles(ctx, juice);
  drawBoops(ctx, juice);
}

function drawSky(ctx: CanvasRenderingContext2D, t: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
  sky.addColorStop(0, COLORS.skyTop);
  sky.addColorStop(1, COLORS.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(-20, -20, LOGICAL_WIDTH + 40, LOGICAL_HEIGHT + 40);

  // Two soft clouds drifting very slowly.
  ctx.fillStyle = COLORS.cloud;
  const drift = (t * 6) % (LOGICAL_WIDTH + 220);
  drawCloud(ctx, drift - 110, 86, 1);
  drawCloud(ctx, LOGICAL_WIDTH - drift * 0.6 + 60, 170, 0.7);
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  ctx.beginPath();
  ctx.arc(x, y, 26 * scale, 0, Math.PI * 2);
  ctx.arc(x + 28 * scale, y - 10 * scale, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 54 * scale, y, 24 * scale, 0, Math.PI * 2);
  ctx.fill();
}

/** Soft halo over Super Inu that brightens when the ball is boopable. */
function drawHitZoneGlow(
  ctx: CanvasRenderingContext2D,
  state: GameState,
): void {
  if (state.status !== "playing") return;
  const hitPoint = getHitPoint(state.bounds);
  const active = isBallInHitZone(state.ball, state.bounds);
  const glow = ctx.createRadialGradient(
    hitPoint.x,
    hitPoint.y,
    10,
    hitPoint.x,
    hitPoint.y,
    HIT_RADIUS,
  );
  glow.addColorStop(0, active ? COLORS.glowActive : "rgba(255,200,120,0.10)");
  glow.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(hitPoint.x, hitPoint.y, HIT_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { groundY, width, height } = state.bounds;
  ctx.fillStyle = COLORS.dirt;
  ctx.fillRect(-20, groundY, width + 40, height - groundY + 20);
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(-20, groundY, width + 40, 26);
  // Scalloped grass edge.
  ctx.fillStyle = COLORS.grassDark;
  for (let x = 0; x < width + 20; x += 26) {
    ctx.beginPath();
    ctx.arc(x, groundY + 26, 9, 0, Math.PI);
    ctx.fill();
  }
}

/* ----- Super Inu (vector fallback, swapped for the PNG if present) --- */

function drawDog(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  juice: JuiceState,
  sprite: HTMLImageElement | null,
): void {
  const { bounds } = state;
  const cx = bounds.width / 2;
  const groundY = bounds.groundY;
  const hop = Math.sin(state.dogHop * Math.PI) * 16; // little jump on taps
  const baseY = groundY - hop;
  const sad = state.status === "gameOver";

  if (sprite) {
    const w = DOG_WIDTH;
    const h = (sprite.height / sprite.width) * w;
    ctx.drawImage(sprite, cx - w / 2, baseY - h, w, h);
    return;
  }

  const wag = Math.sin(juice.wagPhase) * (sad ? 0.05 : 0.35);
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.inuLine;

  // Tail: a curled circle behind the body, wagging.
  ctx.save();
  ctx.translate(DOG_WIDTH * 0.36, -DOG_HEIGHT * 0.42);
  ctx.rotate(wag);
  ctx.fillStyle = COLORS.inuOrange;
  ctx.beginPath();
  ctx.arc(0, 0, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.inuCream;
  ctx.beginPath();
  ctx.arc(2, 2, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body.
  ctx.fillStyle = COLORS.inuOrange;
  roundedBlob(
    ctx,
    -DOG_WIDTH * 0.32,
    -DOG_HEIGHT * 0.52,
    DOG_WIDTH * 0.64,
    DOG_HEIGHT * 0.52,
    26,
  );
  ctx.fill();
  ctx.stroke();

  // Belly patch.
  ctx.fillStyle = COLORS.inuCream;
  ctx.beginPath();
  ctx.ellipse(
    0,
    -DOG_HEIGHT * 0.2,
    DOG_WIDTH * 0.18,
    DOG_HEIGHT * 0.2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Front paws.
  ctx.fillStyle = COLORS.inuCream;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * DOG_WIDTH * 0.16, -7, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Head.
  const headY = -DOG_HEIGHT * 0.72;
  const headR = DOG_WIDTH * 0.3;

  // Ears (behind head).
  ctx.fillStyle = COLORS.inuOrange;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * headR * 0.72, headY - headR * 0.62);
    ctx.rotate(side * 0.25);
    triangle(ctx, 0, 0, 24, 30);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.inuCream;
    triangle(ctx, 0, 4, 12, 16);
    ctx.fill();
    ctx.fillStyle = COLORS.inuOrange;
    ctx.restore();
  }

  ctx.fillStyle = COLORS.inuOrange;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cream muzzle + brow patches.
  ctx.fillStyle = COLORS.inuCream;
  ctx.beginPath();
  ctx.ellipse(
    0,
    headY + headR * 0.4,
    headR * 0.62,
    headR * 0.48,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(
      side * headR * 0.42,
      headY - headR * 0.32,
      7,
      5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Eyes: happy arcs while playing, > < when the run ends.
  ctx.strokeStyle = COLORS.inuLine;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    const ex = side * headR * 0.42;
    const ey = headY - headR * 0.05;
    ctx.beginPath();
    if (sad) {
      ctx.moveTo(ex - 6 * side, ey - 4);
      ctx.lineTo(ex + 4 * side, ey);
      ctx.lineTo(ex - 6 * side, ey + 4);
    } else {
      ctx.arc(ex, ey + 2, 6, Math.PI * 1.15, Math.PI * 1.85);
    }
    ctx.stroke();
  }

  // Nose + mouth.
  ctx.fillStyle = COLORS.inuLine;
  ctx.beginPath();
  ctx.ellipse(0, headY + headR * 0.28, 6, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  if (sad) {
    ctx.arc(0, headY + headR * 0.62, 7, Math.PI * 1.15, Math.PI * 1.85);
  } else {
    ctx.arc(-5, headY + headR * 0.46, 5.5, Math.PI * 0.1, Math.PI * 0.95);
    ctx.arc(5, headY + headR * 0.46, 5.5, Math.PI * 0.05, Math.PI * 0.9);
  }
  ctx.stroke();

  // Blush.
  ctx.fillStyle = "rgba(255, 130, 100, 0.35)";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(
      side * headR * 0.66,
      headY + headR * 0.3,
      7,
      4.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
}

/* ----- Soccer ball ---------------------------------------------------- */

function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  sprite: HTMLImageElement | null,
): void {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  // Squash & stretch: compress vertically, bulge horizontally, conserve area.
  const squash = ball.squash;
  ctx.scale(1 + (1 - squash) * 0.7, squash);
  ctx.rotate(ball.rotation);

  const r = ball.radius;

  if (sprite) {
    ctx.drawImage(sprite, -r, -r, r * 2, r * 2);
    ctx.restore();
    return;
  }

  // Soft drop shadow on the ball itself for depth.
  ctx.fillStyle = COLORS.ballWhite;
  ctx.strokeStyle = COLORS.inuLine;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Classic pattern: center pentagon + ring of partial patches.
  ctx.fillStyle = COLORS.ballPatch;
  pentagon(ctx, 0, 0, r * 0.42, 0);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 + Math.PI / 5;
    const px = Math.cos(angle) * r * 0.92;
    const py = Math.sin(angle) * r * 0.92;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r - 1.5, 0, Math.PI * 2);
    ctx.clip();
    pentagon(ctx, px, py, r * 0.34, angle);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/* ----- Juice ----------------------------------------------------------- */

function drawSparkles(ctx: CanvasRenderingContext2D, juice: JuiceState): void {
  for (const s of juice.sparkles) {
    const life = 1 - s.age / SPARKLE_LIFETIME;
    ctx.globalAlpha = life;
    ctx.fillStyle = s.hue;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3.5 * life + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBoops(ctx: CanvasRenderingContext2D, juice: JuiceState): void {
  for (const b of juice.boops) {
    const progress = b.age / BOOP_LIFETIME;
    const rise = 36 * progress;
    const pop = progress < 0.2 ? 0.6 + 2 * progress : 1;
    ctx.save();
    ctx.translate(b.x, b.y - rise);
    ctx.rotate(b.tilt);
    ctx.scale(pop, pop);
    ctx.globalAlpha = 1 - Math.max(0, progress - 0.5) * 2;
    ctx.font =
      "800 26px ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 6;
    ctx.strokeStyle = COLORS.ballWhite;
    ctx.strokeText(b.text, 0, 0);
    ctx.fillStyle = COLORS.boop;
    ctx.fillText(b.text, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/* ----- Tiny path helpers ------------------------------------------------ */

function roundedBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function triangle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  halfWidth: number,
  height: number,
): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - height);
  ctx.lineTo(cx + halfWidth, cy + height * 0.45);
  ctx.lineTo(cx - halfWidth, cy + height * 0.45);
  ctx.closePath();
}

function pentagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rotation: number,
): void {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = rotation - Math.PI / 2 + (Math.PI * 2 * i) / 5;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
