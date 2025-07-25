// src/app/api/farcaster/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'edge'; // optional but preferred on Vercel

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    const blob = await put(`superinu-${Date.now()}.png`, arrayBuffer, {
    access: 'public',
    contentType: file.type || 'image/png',
    });

    return NextResponse.json({ url: blob.url });
    }   
    catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        console.error('Upload failed:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}