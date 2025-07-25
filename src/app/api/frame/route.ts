import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    frames: [
      {
        text: "SuperInu Miniapp Ready!",
        image: "https://superinu-miniapp.vercel.app/preview.png",
        buttons: [{ label: "Start" }],
      },
    ],
  });
}