// src/app/layout.tsx
import type { Metadata } from "next";
import "~/app/globals.css";
import ClientWrapper from "./client-wrapper";

export const metadata: Metadata = {
  title: "SuperInu",
  description: "Create and share custom SuperInu memes!",
  openGraph: {
    title: "SuperInu",
    description: "Create and share custom SuperInu memes!",
    url: "https://superinu-miniapp.vercel.app",
    images: [
      {
        url: "https://superinu-miniapp.vercel.app/preview.png",
        width: 1200,
        height: 630,
        alt: "SuperInu Meme Preview",
      },
    ],
  },
  other: {
    // Minimal required tags for Farcaster Mini App embed
    "fc:frame": "vNext",
    "fc:frame:post_url": "https://superinu-miniapp.vercel.app/api/frame",
    "fc:frame:button:1": "Start",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}