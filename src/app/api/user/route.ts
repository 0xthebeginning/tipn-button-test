import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fid = searchParams.get('fid');

  if (!fid) {
    return NextResponse.json({ error: 'Missing fid' }, { status: 400 });
  }

  try {
    const r = await fetch(`https://api.warpcast.com/v2/user?fid=${fid}`, {
      // no headers needed; it’s a public endpoint
      cache: 'no-store',
    });

    const json = await r.json();
    return NextResponse.json(json, { status: r.status });
  } catch {
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
  }
}