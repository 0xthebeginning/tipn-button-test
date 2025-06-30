// src/app/frame/manifest.json/route.ts
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    name: "Tip Button Mini App",
    description: "Prototype tipping mini app for developers",
    icon: "https://tipn-button-test.vercel.app/favicon.ico",
    url: "https://tipn-button-test.vercel.app"
  });
}