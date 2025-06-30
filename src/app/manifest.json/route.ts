import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Tipn Button Test",
    description: "Prototype mini app to tip developers",
    icon: "https://tipn-button-test.vercel.app/favicon.ico",
    developerFid: 21024,
    buttons: [
      {
        type: "like",
        label: "Tip this Mini App Dev 💸",
      },
    ],
  });
}