import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    frames: [
      {
        text: "SuperInu Miniapp Ready!",
        image: "https://superinu-miniapp.vercel.app/splash.png",
        buttons: [{ label: "Start" }],
      },
    ],
  });
}

export async function GET() {
  return new Response("OK", { status: 200 });
}