import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Tip Button Mini App",
    description: "Prototype tipping mini app for developers",
    icon: "https://tipn-button-test.vercel.app/favicon.ico",
    url: "https://tipn-button-test.vercel.app",
    button: {
      title: "Tip Dev \u{1F4B8}", // 💸
    },
    action: {
      type: "launch_frame",
      name: "Tip Button",
      url: "https://tipn-button-test.vercel.app",
      splashImageUrl: "https://tipn-button-test.vercel.app/splash.png",
      splashBackgroundColor: "#f7f7f7",
    },
  });
}