import { NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fidParam = searchParams.get('fid');

  if (!fidParam) {
    return NextResponse.json({ error: 'Missing fid' }, { status: 400 });
  }

  const fid = Number(fidParam);
  if (Number.isNaN(fid)) {
    return NextResponse.json({ error: 'Invalid fid' }, { status: 400 });
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing NEYNAR_API_KEY' }, { status: 500 });
  }

  try {
    const client = new NeynarAPIClient({ apiKey });
    const { users } = await client.fetchBulkUsers({ fids: [fid] });
    const u = users?.[0];

    if (!u) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      fid: u.fid,
      custody_address: u.custody_address ?? null,
      verifications: u.verifications ?? [],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'neynar_fetch_failed', detail: msg }, { status: 502 });
  }
}