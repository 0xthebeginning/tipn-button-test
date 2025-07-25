// /src/app/frame/manifest.json/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const accountAssociation = process.env.NEXT_PUBLIC_ACCOUNT_ASSOCIATION
    ? JSON.parse(process.env.NEXT_PUBLIC_ACCOUNT_ASSOCIATION)
    : undefined;

  return NextResponse.json(
    {
      name: "SuperInu",
      description: "SuperInu Miniapp",
      icon: "https://superinu-miniapp.vercel.app/favicon.ico",
      url: "https://superinu-miniapp.vercel.app",
      button: {
        title: "Make a SuperInu Moment 🐶✨",
      },
      action: {
        type: "launch_frame",
        name: "Make a SuperInu Moment 🐶✨",
        url: "https://superinu-miniapp.vercel.app",
        splashImageUrl: "https://superinu-miniapp.vercel.app/splash.png",
        splashBackgroundColor: "#52a842",
      },
      ...(accountAssociation ? { accountAssociation } : {}),
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}