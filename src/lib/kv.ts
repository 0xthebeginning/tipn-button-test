import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { Redis } from "@upstash/redis";
import { APP_NAME } from "./constants";

// In-memory fallback storage
const localStore = new Map<string, FrameNotificationDetails>();

// Use Redis if KV env vars are present, otherwise use in-memory
const useRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const redis = useRedis ? new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
}) : null;

function getUserNotificationDetailsKey(fid: number): string {
  return `${APP_NAME}:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  const key = getUserNotificationDetailsKey(fid);
  if (redis) {
    return await redis.get<FrameNotificationDetails>(key);
  }
  return localStore.get(key) || null;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  const key = getUserNotificationDetailsKey(fid);
  if (redis) {
    await redis.set(key, notificationDetails);
  } else {
    localStore.set(key, notificationDetails);
  }
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  const key = getUserNotificationDetailsKey(fid);
  if (redis) {
    await redis.del(key);
  } else {
    localStore.delete(key);
  }
}

export interface KeepyUppyLeaderboardEntry {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  score: number;
  updatedAt: number;
}

const keepyUppyLocalScores = new Map<number, KeepyUppyLeaderboardEntry>();

const KEEPY_UPPY_LEADERBOARD_KEY = `${APP_NAME}:keepy-uppy:leaderboard`;

function getKeepyUppyUserKey(fid: number): string {
  return `${APP_NAME}:keepy-uppy:user:${fid}`;
}

export async function submitKeepyUppyScore(
  entry: Omit<KeepyUppyLeaderboardEntry, "updatedAt">
): Promise<KeepyUppyLeaderboardEntry> {
  const normalized: KeepyUppyLeaderboardEntry = {
    ...entry,
    score: Math.max(0, Math.floor(entry.score)),
    updatedAt: Date.now(),
  };

  if (redis) {
    const userKey = getKeepyUppyUserKey(normalized.fid);
    const previous = await redis.get<KeepyUppyLeaderboardEntry>(userKey);
    if (previous && previous.score >= normalized.score) return previous;

    await redis.set(userKey, normalized);
    await redis.zadd(KEEPY_UPPY_LEADERBOARD_KEY, {
      score: normalized.score,
      member: String(normalized.fid),
    });
    return normalized;
  }

  const previous = keepyUppyLocalScores.get(normalized.fid);
  if (previous && previous.score >= normalized.score) return previous;
  keepyUppyLocalScores.set(normalized.fid, normalized);
  return normalized;
}

export async function getKeepyUppyScore(
  fid: number
): Promise<KeepyUppyLeaderboardEntry | null> {
  if (redis) {
    return await redis.get<KeepyUppyLeaderboardEntry>(getKeepyUppyUserKey(fid));
  }

  return keepyUppyLocalScores.get(fid) ?? null;
}

export async function getKeepyUppyLeaderboard(
  limit = 10
): Promise<KeepyUppyLeaderboardEntry[]> {
  if (redis) {
    const fids = await redis.zrange<string[]>(
      KEEPY_UPPY_LEADERBOARD_KEY,
      0,
      limit - 1,
      { rev: true }
    );

    const entries = await Promise.all(
      fids.map((fid) => redis.get<KeepyUppyLeaderboardEntry>(getKeepyUppyUserKey(Number(fid))))
    );

    return entries.filter((entry): entry is KeepyUppyLeaderboardEntry => Boolean(entry));
  }

  return Array.from(keepyUppyLocalScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
