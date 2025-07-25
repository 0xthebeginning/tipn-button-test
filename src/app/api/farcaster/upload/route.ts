// src/app/api/farcaster/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const blob = await put(file.name, file.stream(), {
      access: 'public', // or 'private' if you want restricted access
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('Upload to Blob failed:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}