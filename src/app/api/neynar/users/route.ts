// src/app/api/neynar/users/route.ts
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.NEYNAR_API_KEY;
  const { searchParams } = new URL(request.url);
  const fids = searchParams.get('fids');

  if (!apiKey) {
    return NextResponse.json({ error: 'Neynar API key missing' }, { status: 500 });
  }
  if (!fids) {
    return NextResponse.json({ error: 'FIDs parameter is required' }, { status: 400 });
  }

  try {
    const neynar = new NeynarAPIClient({ apiKey });
    const fidsArray = fids.split(',').map((fid) => parseInt(fid.trim(), 10));
    const { users } = await neynar.fetchBulkUsers({ fids: fidsArray });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}