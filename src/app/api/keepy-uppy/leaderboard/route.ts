import { NextResponse } from 'next/server';
import { getKeepyUppyLeaderboard } from '~/lib/kv';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') ?? 10);
  const limit = Number.isInteger(limitParam)
    ? Math.min(Math.max(limitParam, 1), 50)
    : 10;

  try {
    const leaderboard = await getKeepyUppyLeaderboard(limit);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Failed to fetch keepy-uppy leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
