import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST() {
  await redis.del('SuperInu:keepy-uppy:user:999999');
  await redis.zrem('SuperInu:keepy-uppy:leaderboard', '999999');

  return NextResponse.json({ deleted: true });
}
