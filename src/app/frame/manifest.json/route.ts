import { NextResponse } from "next/server";

// GET handler for Mini App manifest
export async function GET() {
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
      accountAssociation: {
        header:
          "eyJmaWQiOjIxMDI0LCJ0eXBlIjoiYXV0aCIsImtleSI6IjB4MWEwQTJhQkRmRTlCMThDQjgxQjg5NGQ3MEMwOGQ0MTBiYTQxNWM4NSJ9",
        payload:
          "eyJkb21haW4iOiJzdXBlcmludS1taW5pYXBwLnZlcmNlbC5hcHAifQ",
        signature:
          "yxEn/4kbNiUK3SPK39qwctGsHjQGjVVnIlWY3jwNQwB3lw3xJXT3TBePtkFk7DswVufsH3p5bJc1Eorsk8NkgBs=",
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}

// POST handler for frame interactions
export async function POST() {
  return NextResponse.json({ message: "Frame POST received" });
}