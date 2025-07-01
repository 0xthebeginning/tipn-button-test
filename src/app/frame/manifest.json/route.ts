// /src/app/frame/manifest.json/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Tip Button Mini App",
    description: "Prototype tipping mini app for developers",
    icon: "https://tipn-button-test.vercel.app/favicon.ico",
    url: "https://tipn-button-test.vercel.app",
    button: {
      title: "Tip Dev",
    },
    action: {
      type: "launch_frame",
      name: "Tip Button",
      url: "https://tipn-button-test.vercel.app",
      splashImageUrl: "https://tipn-button-test.vercel.app/api/opengraph-image?fid=21024",
      splashBackgroundColor: "#f7f7f7",
    },
  }, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}