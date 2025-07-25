// /src/app/.well-known/farcaster.json/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    frame: {
      version: '1',
      name: 'SuperInu',
      iconUrl: 'https://superinu-miniapp.vercel.app/favicon.ico',
      homeUrl: 'https://superinu-miniapp.vercel.app',
      imageUrl: 'https://superinu-miniapp.vercel.app/og.png',
      buttonTitle: 'Make a SuperInu Moment 🐶✨',
      splashImageUrl: 'https://superinu-miniapp.vercel.app/splash.png',
      splashBackgroundColor: '#52a842',
      description: 'Create and share custom SuperInu memes!',
      primaryCategory: 'meme',
      tags: ['meme', 'dog', 'fun'],
    },
  });
}
