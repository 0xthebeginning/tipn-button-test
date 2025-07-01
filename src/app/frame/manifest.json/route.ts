// src/app/frame/manifest.json/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host");
  if (!host) return NextResponse.error();

  const base = `https://${host}`;

  return NextResponse.json({
    accountAssociation: {
      // Optional: use Warpcast dev tool or Farcaster manifest tool to generate these
      // header: "...",
      // payload: "...",
      // signature: "...",
    },
    frame: {
      version: "1",
      name: "Tip Button Mini App",
      subtitle: "Developer tipping utility",
      description: "Prototype tipping mini app for developers",
      iconUrl: `${base}/favicon.ico`,
      homeUrl: base,
      imageUrl: `${base}/api/opengraph-image`,          // Optional open-graph image
      buttonTitle: "Tip Dev",
      splashImageUrl: `${base}/splash.png`,              // Optional splash image
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${base}/api/webhook`,                // Optional for tip/webhook events
      // Additional optional fields:
      // primaryCategory: "developer-tools",
      // tags: ["tips","developers"],
      // screenshotUrls: [`${base}/screenshots/1.png`],
      // heroImageUrl: `${base}/hero.png`
    }
  });
}