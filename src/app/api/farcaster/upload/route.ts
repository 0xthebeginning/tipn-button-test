// src/app/api/farcaster/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'edge'; // preferred for performance

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Invalid or missing file' }, { status: 400 });
    }

    const blob = await put(`superinu-${Date.now()}.png`, file, {
      access: 'public',
      contentType: file.type || 'image/png',
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('Upload failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}