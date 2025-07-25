import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const uploadForm = new FormData();
  uploadForm.append('file', file);

  const res = await fetch('https://api.neynar.com/v2/farcaster/upload/image', {
    method: 'POST',
    headers: {
      'api_key': NEYNAR_API_KEY,
    },
    body: uploadForm,
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('Neynar upload failed:', error);
    return NextResponse.json({ error }, { status: res.status });
  }

  const json = await res.json();
  return NextResponse.json(json);
}